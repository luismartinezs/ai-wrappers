import mongoose, { Schema, model, models } from "mongoose"

export interface UserDocument extends mongoose.Document {
  email: string
  password: string
  name: string
  phone: string
  image: string
  role: "user" | "admin"
  isEmailVerified: boolean
  lastLogin: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address"
      ]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false // Don't include password by default in queries
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot be more than 50 characters"]
    },
    phone: {
      type: String,
      default: "",
      trim: true
    },
    image: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true
  }
)

// Method to check if password reset token is valid
UserSchema.methods.isResetTokenValid = function (token: string): boolean {
  return (
    this.passwordResetToken === token &&
    this.passwordResetExpires &&
    this.passwordResetExpires > new Date()
  )
}

// Check if the model exists before creating a new one
// This is needed for Next.js hot reloading
export const User = models.User || model<UserDocument>("User", UserSchema, process.env.MONGODB_DB_NAME || "ai-wrappers")