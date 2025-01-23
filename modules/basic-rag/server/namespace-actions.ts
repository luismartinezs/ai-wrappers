"use server"

import { ObjectId } from "mongodb"
import { getCollection } from "@/modules/mongodb/server/mongodb-utils"
import { RagNamespaceModel, RAG_NAMESPACES_COLLECTION, CreateRagNamespaceInput } from "../models/namespace"

// Helper function to serialize MongoDB documents
function serializeNamespace(namespace: RagNamespaceModel) {
  return {
    ...namespace,
    _id: namespace._id.toString(),
    createdAt: namespace.createdAt.toISOString(),
    updatedAt: namespace.updatedAt.toISOString()
  }
}

export async function getNamespacesAction(userEmail: string) {
  try {
    const collection = await getCollection<RagNamespaceModel>(RAG_NAMESPACES_COLLECTION)

    const namespaces = await collection
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .toArray()

    return {
      success: true as const,
      data: namespaces.map(serializeNamespace)
    }
  } catch (error) {
    console.error("Error fetching namespaces:", error)
    return {
      success: false as const,
      error: "Failed to fetch namespaces"
    }
  }
}

export async function createNamespaceAction(userEmail: string, name: string) {
  try {
    const collection = await getCollection<RagNamespaceModel>(RAG_NAMESPACES_COLLECTION)
    const now = new Date()

    const namespace: CreateRagNamespaceInput = {
      userEmail,
      name,
      createdAt: now,
      updatedAt: now
    }

    const result = await collection.insertOne(namespace as any)
    return {
      success: true as const,
      data: serializeNamespace({ ...namespace, _id: result.insertedId } as RagNamespaceModel)
    }
  } catch (error) {
    console.error("Error creating namespace:", error)
    return {
      success: false as const,
      error: "Failed to create namespace"
    }
  }
}

export async function deleteNamespaceAction(userEmail: string, namespaceId: string) {
  try {
    const collection = await getCollection<RagNamespaceModel>(RAG_NAMESPACES_COLLECTION)
    const objectId = new ObjectId(namespaceId)

    const result = await collection.deleteOne({
      _id: objectId,
      userEmail // Ensure user owns the namespace
    })

    if (result.deletedCount === 0) {
      return {
        success: false as const,
        error: "Namespace not found or unauthorized"
      }
    }

    return {
      success: true as const,
      data: { _id: namespaceId }
    }
  } catch (error) {
    console.error("Error deleting namespace:", error)
    return {
      success: false as const,
      error: "Failed to delete namespace"
    }
  }
}

// Type for the response from namespace actions
export type NamespaceActionResponse<T = any> =
  | { success: true; data: T }
  | { success: false; error: string }