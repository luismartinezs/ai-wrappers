"use server"

import mongoose from "mongoose"
import { connectDB } from "./mongodb-client"

export async function getDb(): Promise<mongoose.Connection> {
  await connectDB()
  return mongoose.connection
}

export async function getCollection<T extends mongoose.Document>(
  collectionName: string,
): Promise<mongoose.Collection<T>> {
  const connection = await getDb()
  return connection.collection(collectionName)
}

export async function ping(): Promise<boolean> {
  try {
    await connectDB()
    const status = mongoose.connection.readyState === 1
    return status
  } catch (error) {
    console.error("MongoDB ping failed:", error)
    return false
  }
}