"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Plus } from "lucide-react"
import { getNamespacesAction, createNamespaceAction } from "../server/namespace-actions"
import { SerializedRagNamespace } from "../models/namespace"
import { useRag } from "./rag-context"

export function NamespaceSelector() {
  const [namespaces, setNamespaces] = React.useState<SerializedRagNamespace[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [newNamespace, setNewNamespace] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const { data: session } = useSession()
  const { selectedNamespace, setSelectedNamespace } = useRag()

  const loadNamespaces = React.useCallback(async () => {
    if (!session?.user?.email) return

    const result = await getNamespacesAction(session.user.email)
    if (result.success) {
      setNamespaces(result.data)
      if (!selectedNamespace && result.data.length > 0) {
        setSelectedNamespace(result.data[0])
      }
    }
    setIsLoading(false)
  }, [session?.user?.email, selectedNamespace, setSelectedNamespace])

  React.useEffect(() => {
    loadNamespaces()
  }, [loadNamespaces])

  const handleCreateNamespace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email || !newNamespace.trim() || isCreating) return

    setIsCreating(true)
    try {
      const result = await createNamespaceAction(session.user.email, newNamespace.trim())
      if (result.success) {
        setNewNamespace("")
        setSelectedNamespace(result.data)
        loadNamespaces()
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateNamespace} className="flex gap-2">
        <Input
          value={newNamespace}
          onChange={(e) => setNewNamespace(e.target.value)}
          placeholder="New namespace name"
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isCreating || !newNamespace.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading namespaces...</p>
      ) : namespaces.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You currently do not have any namespaces
        </p>
      ) : (
        <ul className="space-y-1">
          {namespaces.map((namespace) => (
            <li
              key={namespace._id}
              className={`text-sm p-2 rounded-md hover:bg-muted cursor-pointer ${
                selectedNamespace?._id === namespace._id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedNamespace(namespace)}
            >
              {namespace.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}