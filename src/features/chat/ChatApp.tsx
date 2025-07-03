"use client";

import { useChat } from "./hooks/useChat";
import { ChatHeader } from "./ui/ChatHeader";
import { MessageList } from "./ui/MessageList";
import { ChatInput } from "./ui/ChatInput";

interface ChatAppProps {
  id: string;
}

export const ChatApp = ({ id }: ChatAppProps) => {
  const {
    messages,
    inputText,
    setInputText,
    isProcessing,
    messagesEndRef,
    sendMessage,
    handleKeyPress,
    clearChat,
  } = useChat(id);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <ChatHeader onClearChat={clearChat} />

      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={sendMessage}
        onKeyPress={handleKeyPress}
        isProcessing={isProcessing}
      />
    </div>
  );
};
