"use server"

import { ObjectId } from "mongodb"
import { getCollection } from "../server/mongodb-utils"
import { NamespaceModel, CreateNamespaceInput } from "../models/namespace"

const COLLECTION_NAME = "namespaces"

export async function createNamespace(namespace: CreateNamespaceInput) {
  const collection = await getCollection<NamespaceModel>(COLLECTION_NAME)
  const now = new Date()

  const doc = {
    ...namespace,
    createdAt: now,
    updatedAt: now
  }

  const result = await collection.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

export async function getNamespacesByUser(userId: string) {
  const collection = await getCollection<NamespaceModel>(COLLECTION_NAME)
  return collection.find({ userId }).toArray()
}

export async function getNamespaceById(_id: string | ObjectId, userId: string) {
  const collection = await getCollection<NamespaceModel>(COLLECTION_NAME)
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id
  return collection.findOne({ _id: objectId, userId })
}

export async function updateNamespace(_id: string | ObjectId, userId: string, update: Partial<NamespaceModel>) {
  const collection = await getCollection<NamespaceModel>(COLLECTION_NAME)
  const now = new Date()
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id

  return collection.findOneAndUpdate(
    { _id: objectId, userId },
    { $set: { ...update, updatedAt: now } },
    { returnDocument: "after" }
  )
}

export async function deleteNamespace(_id: string | ObjectId, userId: string) {
  const collection = await getCollection<NamespaceModel>(COLLECTION_NAME)
  const objectId = typeof _id === "string" ? new ObjectId(_id) : _id
  return collection.deleteOne({ _id: objectId, userId })
}