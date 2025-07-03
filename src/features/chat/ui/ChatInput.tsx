// 채팅에 쓰이는 입력 컴포넌트

interface ChatInputProps {
  inputText: string
  setInputText: (text: string) => void
  onSendMessage: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isProcessing: boolean
}

export const ChatInput = ({
  inputText,
  setInputText,
  onSendMessage,
  onKeyPress,
  isProcessing,
}: ChatInputProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="유재석에게 하고 싶은 말을 편하게 적어보세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
          <button
            onClick={onSendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 self-end"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>전송 중</span>
              </div>
            ) : (
              '전송'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}