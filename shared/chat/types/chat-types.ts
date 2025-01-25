export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface ChatProps {
  messages: Message[]
  isLoading?: boolean
  onSendMessage: (message: string) => void | Promise<void>
}