"use server"

import { ObjectId } from "mongodb"
import { getCollection } from "../server/mongodb-utils"
import { MessageModel, CreateMessageInput } from "../models/message"

const COLLECTION_NAME = "messages"

export async function createMessage(message: CreateMessageInput) {
  const collection = await getCollection<MessageModel>(COLLECTION_NAME)
  const now = new Date()

  const doc = {
    ...message,
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function getMessagesByChat(chatId: string) {
  const collection = await getCollection<MessageModel>(COLLECTION_NAME)
  return collection.find({ chatId }).sort({ createdAt: 1 }).toArray()
}

export async function getMessageById(_id: string | ObjectId) {
  const collection = await getCollection<MessageModel>(COLLECTION_NAME)
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id
  return collection.findOne({ _id: objectId })
}

export async function updateMessage(_id: string | ObjectId, update: Partial<MessageModel>) {
  const collection = await getCollection<MessageModel>(COLLECTION_NAME)
  const now = new Date()
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id

  return collection.findOneAndUpdate(
    { _id: objectId },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" }
  )
}

export async function deleteMessage(_id: string | ObjectId) {
  const collection = await getCollection<MessageModel>(COLLECTION_NAME)
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id
  return collection.deleteOne({ _id: objectId })
}