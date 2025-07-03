// Chat feature public API
export { ChatApp } from './ChatApp'
export { ChatHeader } from './ui/ChatHeader'
export { ChatInput } from './ui/ChatInput'
export { MessageBubble } from './ui/Bubble'
export { MessageList } from './ui/MessageList'

export { useChat } from './hooks/useChat'

export { sendMessageToAI } from './api'
export type { SendMessageRequest } from './api'

export type { Message, Language } from './entities'
export { LANGUAGES } from './entities' 