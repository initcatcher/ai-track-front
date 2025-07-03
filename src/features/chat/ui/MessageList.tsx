import { Message } from '../entities'
import { MessageBubble } from './Bubble'

interface MessageListProps {
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export const MessageList = ({ messages, messagesEndRef }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <div className="text-6xl mb-4">💕</div>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              안녕하세요! 유재석입니다 😊
            </p>
            <p className="text-base mb-4">
              오늘 하루는 어떠셨어요? 편하게 대화해요!
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>팁:</strong> 연애 고민, 일상 이야기, 고민 상담 등<br/>
                무엇이든 편하게 말씀해주세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
} 