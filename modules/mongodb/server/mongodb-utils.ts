"use server"

import { Collection, Db, Document } from "mongodb"
import { clientPromise } from "./mongodb-client"

export async function getDb(dbName?: string): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName || process.env.MONGODB_DB_NAME)
}

export async function getCollection<T extends Document = Document>(
  collectionName: string,
  dbName?: string
): Promise<Collection<T>> {
  const db = await getDb(dbName)
  return db.collection<T>(collectionName)
}

export async function ping(): Promise<boolean> {
  try {
    const client = await clientPromise
    await client.db().command({ ping: 1 })
    return true
  } catch (error) {
    console.error("MongoDB ping failed:", error)
    return false
  }
}