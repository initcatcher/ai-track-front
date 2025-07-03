"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SSEConnectionProps {
  url?: string;
  onMessage?: (data: string) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoConnect?: boolean;
}

interface SSEMessage {
  id: string;
  data: string;
  timestamp: Date;
}

interface TranslationRequest {
  text: string;
  source_language: string;
  target_language: string;
}

export default function SSEConnection({
  url = "/api/translate/stream-sse",
  onMessage,
  onError,
  onOpen,
  onClose,
  autoConnect = false,
}: SSEConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [inputData, setInputData] = useState(
    JSON.stringify(
      {
        text: "안녕하세요! 어떻게 지내세요?",
        source_language: "Korean",
        target_language: "English",
      },
      null,
      2
    )
  );

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const connect = useCallback(async () => {
    if (isConnected) return;

    setConnectionStatus("connecting");
    setError(null);

    try {
      abortControllerRef.current = new AbortController();

      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      const requestBody = JSON.parse(inputData) as TranslationRequest;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      setIsConnected(true);
      setConnectionStatus("connected");
      setReconnectAttempts(0);
      onOpen?.();

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsConnected(false);
          setConnectionStatus("disconnected");
          onClose?.();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = line.slice(6); // "data: " 제거
              if (data.trim() === "[DONE]") {
                setIsConnected(false);
                setConnectionStatus("disconnected");
                onClose?.();
                return;
              }

              const message: SSEMessage = {
                id:
                  Date.now().toString() +
                  Math.random().toString(36).substr(2, 9),
                data: data,
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, message]);
              onMessage?.(data);
            } catch (err) {
              console.error("SSE 메시지 파싱 오류:", err);
            }
          }
        }
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.");
      setIsConnected(false);
      setConnectionStatus("error");
      setError(error.message);
      onError?.(error);

      // 자동 재연결 시도
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connect();
        }, delay);
      }
    }
  }, [
    url,
    inputData,
    onOpen,
    onClose,
    isConnected,
    onError,
    reconnectAttempts,
    API_BASE_URL,
  ]);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("disconnected");
    setReconnectAttempts(0);
    onClose?.();
  }, [onClose]);

  const clearMessages = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-500";
      case "connecting":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "연결됨";
      case "connecting":
        return "연결중...";
      case "error":
        return "오류";
      default:
        return "연결 안됨";
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          SSE 연결
        </h2>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* 요청 데이터 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          번역 요청 데이터
        </label>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          disabled={isConnected}
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono text-sm"
          placeholder="JSON 형태의 번역 요청 데이터를 입력하세요"
        />
      </div>

      <div className="flex space-x-3 mb-4">
        <button
          onClick={connect}
          disabled={connectionStatus === "connecting" || isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          연결
        </button>
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          연결 해제
        </button>
        <button
          onClick={clearMessages}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          메시지 초기화
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          {reconnectAttempts > 0 && (
            <div className="mt-1 text-sm">
              재연결 시도: {reconnectAttempts}/{maxReconnectAttempts}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            수신된 메시지 ({messages.length})
          </h3>
        </div>

        <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              아직 메시지가 없습니다.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="mb-3 p-3 bg-white dark:bg-gray-600 rounded border"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {message.id}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {message.data}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
