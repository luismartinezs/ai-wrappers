"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Plus, Trash2, Check } from "lucide-react"
import { getNamespacesAction, createNamespaceAction, deleteNamespaceAction } from "../server/namespace-actions"
import { SerializedRagNamespace } from "../models/namespace"
import { useRag } from "../context/rag-context"
import { ChatList } from "./chat-list"

export function RagSettings() {
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
      // Select the first namespace if none is selected
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
        // Select the newly created namespace
        setSelectedNamespace(result.data)
        loadNamespaces()
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteNamespace = async (namespaceId: string) => {
    if (!session?.user?.email) return

    const confirmed = window.confirm("Are you sure you want to delete this namespace?")
    if (!confirmed) return

    const result = await deleteNamespaceAction(session.user.email, namespaceId)
    if (result.success) {
      // If the deleted namespace was selected, clear the selection
      if (selectedNamespace?._id === namespaceId) {
        setSelectedNamespace(null)
      }
      loadNamespaces()
    }
  }

  const handleNamespaceClick = (namespace: SerializedRagNamespace) => {
    setSelectedNamespace(namespace)
  }

  return (
    <aside className="w-64 border-r h-[calc(100vh-4rem)] p-4 flex flex-col">
      <div className="flex flex-col flex-1 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Namespaces</h2>

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
                  className={`text-sm p-2 rounded-md hover:bg-muted flex items-center justify-between group cursor-pointer ${
                    selectedNamespace?._id === namespace._id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleNamespaceClick(namespace)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-4 flex-shrink-0">
                      {selectedNamespace?._id === namespace._id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <span className="truncate">{namespace.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNamespace(namespace._id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t pt-6">
          <ChatList />
        </div>
      </div>
    </aside>
  )
}