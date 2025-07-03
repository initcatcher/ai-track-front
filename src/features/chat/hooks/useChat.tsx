"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "../entities";
import { sendMessageToAI } from "../api";
import {
  getMessagesFromLocal,
  saveMessagesToLocal,
  getTempMessage,
  clearTempMessage,
} from "@/features/chat/lib/session";
import { syncMessages } from "@/features/chat/lib/api";

export const useChat = (id: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [language, setLanguage] = useState("Korean");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 임시 메시지를 사용한 자동 전송
  const sendMessageWithTemp = useCallback(
    async (message: string) => {
      if (!message.trim() || isProcessing) return;

      const userMessageId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const userMessage: Message = {
        id: userMessageId,
        text: message.trim(),
        timestamp: new Date(),
        isUser: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      setIsProcessing(true);

      try {
        // AI 응답 메시지 추가 (로딩 상태)
        const aiMessageId =
          Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const aiMessage: Message = {
          id: aiMessageId,
          text: "",
          timestamp: new Date(),
          isUser: false,
          isLoading: true,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // AI 응답 생성 (스트리밍) - id 파라미터 추가
        const aiResponseText = await sendMessageToAI(
          id,
          { message: message.trim(), language },
          (partialResponse) => {
            // 실시간으로 메시지 업데이트
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? { ...msg, text: partialResponse, isLoading: false }
                  : msg
              )
            );
          }
        );

        // 최종 응답으로 한 번 더 업데이트 (완료 상태)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? { ...msg, text: aiResponseText, isLoading: false }
              : msg
          )
        );

        // 성공적으로 전송되었으므로 임시 메시지 삭제
        clearTempMessage();
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id && !msg.isUser && msg.isLoading) {
              return {
                ...msg,
                text: "AI 응답 중 오류가 발생했습니다.",
                isLoading: false,
              };
            }
            return msg;
          })
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [id, language, isProcessing]
  );

  // 로컬스토리지에서 메시지 불러오기 및 서버 동기화
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 로컬스토리지에서 메시지 불러오기
        const localMessages = getMessagesFromLocal(id);

        // 서버와 동기화
        const syncedMessages = await syncMessages(id, localMessages);

        // Message 형식으로 변환
        const convertedMessages: Message[] = syncedMessages.map(
          (msg, index) => ({
            id: `${msg.timestamp}_${index}`,
            text: msg.content,
            timestamp: new Date(msg.timestamp * 1000),
            isUser: msg.role === "user",
          })
        );

        setMessages(convertedMessages);

        // 동기화된 메시지를 로컬스토리지에 저장
        saveMessagesToLocal(id, syncedMessages);

        // 임시 메시지 확인 및 자동 전송
        const tempMessage = getTempMessage();
        if (tempMessage) {
          setInputText(tempMessage);
          // 잠시 후 자동 전송
          setTimeout(() => {
            sendMessageWithTemp(tempMessage);
          }, 100);
        }
      } catch (error) {
        console.error("채팅 초기화 실패:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeChat();
  }, [id, sendMessageWithTemp]);

  // 메시지 변경 시 로컬스토리지에 저장
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      const chatMessages = messages.map((msg) => ({
        role: msg.isUser ? ("user" as const) : ("assistant" as const),
        content: msg.text,
        timestamp: msg.timestamp.getTime() / 1000,
      }));
      saveMessagesToLocal(id, chatMessages);
    }
  }, [messages, id, isInitialized]);

  const sendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessageId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const userMessage: Message = {
      id: userMessageId,
      text: inputText.trim(),
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const originalText = inputText.trim();
    setInputText("");
    setIsProcessing(true);

    try {
      // AI 응답 메시지 추가 (로딩 상태)
      const aiMessageId =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const aiMessage: Message = {
        id: aiMessageId,
        text: "",
        timestamp: new Date(),
        isUser: false,
        isLoading: true,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // AI 응답 생성 (스트리밍) - id 파라미터 추가
      const aiResponseText = await sendMessageToAI(
        id,
        { message: originalText, language },
        (partialResponse) => {
          // 실시간으로 메시지 업데이트
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, text: partialResponse, isLoading: false }
                : msg
            )
          );
        }
      );

      // 최종 응답으로 한 번 더 업데이트 (완료 상태)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? { ...msg, text: aiResponseText, isLoading: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id && !msg.isUser && msg.isLoading) {
            return {
              ...msg,
              text: "AI 응답 중 오류가 발생했습니다.",
              isLoading: false,
            };
          }
          return msg;
        })
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    inputText,
    setInputText,
    language,
    setLanguage,
    isProcessing,
    messagesEndRef,
    sendMessage,
    handleKeyPress,
    clearChat,
  };
};
