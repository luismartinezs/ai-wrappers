import mongoose from "mongoose"
import { logger } from "@/shared/utils/logger"

let isConnected = false

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable")
}

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB_NAME || "ai-wrappers"

if (!process.env.MONGODB_DB_NAME) {
  logger("mongodb", "MONGODB_DB_NAME not set, using default", { dbName: DB_NAME })
}

export async function connectDB() {
  if (isConnected) return

  try {
    logger("mongodb", "Attempting to connect to MongoDB", {
      uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"),
      database: DB_NAME,
      mongooseDefaultDb: mongoose.connection.name || "none"
    })

    // Force disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    const db = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      dbName: DB_NAME
    })

    isConnected = db.connections[0].readyState === 1
    logger("mongodb", "MongoDB connected successfully", {
      database: db.connections[0].name,
      host: db.connections[0].host,
      collections: Object.keys(db.connections[0].collections),
      readyState: db.connections[0].readyState
    })
  } catch (error) {
    logger("mongodb", "MongoDB connection error", error)
    throw new Error("Failed to connect to database")
  }

  mongoose.connection.on("error", (err) => {
    logger("mongodb", "MongoDB connection error", err)
    isConnected = false
  })

  mongoose.connection.on("disconnected", () => {
    logger("mongodb", "MongoDB disconnected")
    isConnected = false
  })

  // Gracefully close the connection when the process is terminated
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close()
      logger("mongodb", "MongoDB connection closed through app termination")
      process.exit(0)
    } catch (err) {
      logger("mongodb", "Error closing MongoDB connection", err)
      process.exit(1)
    }
  })
}