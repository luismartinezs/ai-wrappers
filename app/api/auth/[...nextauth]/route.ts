import NextAuth from "next-auth"
import { authOptions } from "@/modules/auth/server/auth-options"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }