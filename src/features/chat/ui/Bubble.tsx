import { Message } from "../entities";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md rounded-lg p-3 shadow-md ${
          message.isUser
            ? "bg-blue-500 text-white"
            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
        }`}
      >
        {/* 발신자 표시 */}
        <div
          className={`text-xs mb-1 ${
            message.isUser
              ? "text-blue-100"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {message.isUser ? "나" : "유재석"}
        </div>

        {/* 메시지 내용 */}
        <div className="font-medium">
          {message.isLoading ? (
            <div
              className={`flex items-center space-x-2 ${
                message.isUser
                  ? "text-blue-100"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <div
                className={`animate-spin w-4 h-4 border-2 rounded-full ${
                  message.isUser
                    ? "border-blue-200 border-t-transparent"
                    : "border-gray-300 border-t-transparent dark:border-gray-500"
                }`}
              ></div>
              <span className="text-sm">유재석님이 답변 중...</span>
            </div>
          ) : (
            message.text
          )}
        </div>

        {/* 시간 정보 */}
        <div
          className={`text-xs mt-2 ${
            message.isUser
              ? "text-blue-200"
              : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
