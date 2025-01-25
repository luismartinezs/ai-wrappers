import { connectDB } from "@/modules/mongodb/server/mongodb-client"
import { User, UserDocument } from "@/modules/auth/server/user-model"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { logger } from "@/shared/utils/logger"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }

  interface User extends UserDocument {}
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Missing GOOGLE_CLIENT_ID environment variable")
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_CLIENT_SECRET environment variable")
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable")
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        logger("auth", "Credentials auth attempt", { email: credentials?.email })

        if (!credentials?.email || !credentials?.password) {
          logger("auth", "Missing credentials")
          throw new Error("Missing credentials")
        }

        try {
          await connectDB()

          const user = await User.findOne({
            email: credentials.email
          }).select("+password")

          logger("auth", "User lookup result", {
            found: !!user,
            email: credentials.email
          })

          if (!user) throw new Error("Invalid email or password")

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )

          logger("auth", "Password check", {
            match: passwordMatch,
            email: credentials.email
          })

          if (!passwordMatch) throw new Error("Invalid email or password")

          // Return user without password
          const { password, ...userWithoutPassword } = user.toObject()
          logger("auth", "Credentials auth successful", {
            id: userWithoutPassword._id,
            email: userWithoutPassword.email
          })
          return userWithoutPassword
        } catch (error) {
          logger("auth", "Authentication error", error)
          throw new Error("Authentication failed")
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      logger("auth", "Sign in attempt", {
        user: { ...user, email: user.email },
        provider: account?.provider
      })

      if (account?.provider === "google") {
        try {
          await connectDB()

          if (!user.email) {
            logger("auth", "Google sign in error: No email provided")
            throw new Error("No email provided by Google")
          }

          let dbUser = await User.findOne({ email: user.email })
          logger("auth", "Existing user check", {
            found: !!dbUser,
            email: user.email,
            provider: "google"
          })

          if (!dbUser) {
            if (!user.name) {
              logger("auth", "Google sign in error: No name provided")
              throw new Error("No name provided by Google")
            }

            dbUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image || "",
              password: await bcrypt.hash(Math.random().toString(36), 10)
            })
            logger("auth", "New user created", {
              id: dbUser._id,
              email: dbUser.email,
              provider: "google"
            })
          } else {
            // Update existing user's info from Google
            dbUser.name = user.name || dbUser.name
            dbUser.image = user.image || dbUser.image
            await dbUser.save()
            logger("auth", "Existing user updated", {
              id: dbUser._id,
              email: dbUser.email,
              provider: "google"
            })
          }

          // Attach MongoDB _id to the user object
          user._id = dbUser._id
          user.role = dbUser.role || "user"

          logger("auth", "Google auth successful", {
            id: user._id,
            email: user.email,
            role: user.role
          })
          return true
        } catch (error) {
          logger("auth", "Google sign in error", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      logger("auth", "JWT callback", {
        tokenBefore: { ...token },
        user: user ? { id: user._id, role: user.role } : 'no user'
      })

      if (user) {
        token.id = user._id
        token.role = user.role || "user"
      }

      logger("auth", "JWT token updated", { ...token })
      return token
    },
    async session({ session, token }) {
      logger("auth", "Session callback", {
        sessionBefore: { ...session },
        token: { ...token }
      })

      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || "user"
      }

      logger("auth", "Session updated", {
        sessionAfter: { ...session },
        token: { ...token }
      })
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
}