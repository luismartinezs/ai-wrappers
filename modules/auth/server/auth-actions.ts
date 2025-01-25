"use server"

import { connectDB } from "@/modules/mongodb/server/mongodb-client"
import { User } from "@/modules/auth/server/user-model"
import bcrypt from "bcryptjs"
import { ActionState } from "@/shared/types/actions-types"
import { logger } from "@/shared/utils/logger"
import mongoose from "mongoose"

interface RegisterData {
  email: string
  password: string
  name: string
}

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

function isPasswordStrong(password: string): { isValid: boolean; message: string } {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long"
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter"
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter"
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number"
    }
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character"
    }
  }

  return { isValid: true, message: "" }
}

function checkRateLimit(email: string): { isAllowed: boolean; message: string } {
  const now = Date.now()
  const userAttempts = loginAttempts.get(email)

  if (userAttempts) {
    // Reset attempts if lockout time has passed
    if (now - userAttempts.lastAttempt > LOCKOUT_TIME) {
      loginAttempts.delete(email)
    } else if (userAttempts.count >= MAX_ATTEMPTS) {
      const timeLeft = Math.ceil(
        (LOCKOUT_TIME - (now - userAttempts.lastAttempt)) / 1000 / 60
      )
      return {
        isAllowed: false,
        message: `Too many attempts. Please try again in ${timeLeft} minutes`
      }
    }
  }

  return { isAllowed: true, message: "" }
}

export async function registerAction(
  values: RegisterData
): Promise<ActionState<void>> {
  try {
    logger("auth", "Registration attempt", { email: values.email })
    const { email, password, name } = values

    if (!email || !password || !name) {
      logger("auth", "Missing registration fields")
      return {
        isSuccess: false,
        message: "All fields are required"
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      logger("auth", "Invalid email format", { email })
      return {
        isSuccess: false,
        message: "Invalid email format"
      }
    }

    // Validate password strength
    const passwordCheck = isPasswordStrong(password)
    if (!passwordCheck.isValid) {
      logger("auth", "Password validation failed", { message: passwordCheck.message })
      return {
        isSuccess: false,
        message: passwordCheck.message
      }
    }

    await connectDB()

    const userFound = await User.findOne({ email })
    if (userFound) {
      logger("auth", "Email already exists", { email })
      return {
        isSuccess: false,
        message: "Email already exists"
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({
      name,
      email,
      password: hashedPassword
    })

    const savedUser = await user.save()
    logger("auth", "User registered successfully", {
      id: savedUser._id,
      email: savedUser.email,
      database: mongoose.connection.name
    })

    return {
      isSuccess: true,
      message: "User registered successfully",
      data: undefined
    }
  } catch (error) {
    logger("auth", "Registration error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return {
      isSuccess: false,
      message: "An error occurred during registration"
    }
  }
}
