"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface StreamingConnectionProps {
  url?: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
}

interface StreamChunk {
  id: string;
  content: string;
  timestamp: Date;
}

export default function StreamingConnection({
  url = "/api/translate/stream",
  method = "POST",
  headers = { "Content-Type": "application/json" },
  body,
  onChunk,
  onComplete,
  onError,
  autoStart = false,
}: StreamingConnectionProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [chunks, setChunks] = useState<StreamChunk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<
    "idle" | "connecting" | "streaming" | "completed" | "error"
  >("idle");
  const [inputData, setInputData] = useState(
    JSON.stringify(
      body || {
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

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const startStreaming = useCallback(async () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setStreamingStatus("connecting");
    setError(null);
    setChunks([]);

    try {
      // 기존 AbortController가 있다면 정리
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
      const requestBody = method === "POST" ? JSON.parse(inputData) : undefined;

      const response = await fetch(fullUrl, {
        method,
        headers,
        body: requestBody ? JSON.stringify(requestBody) : undefined,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      setStreamingStatus("streaming");

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setStreamingStatus("completed");
          setIsStreaming(false);
          onComplete?.();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const streamChunk: StreamChunk = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          content: chunk,
          timestamp: new Date(),
        };

        setChunks((prev) => [...prev, streamChunk]);
        onChunk?.(chunk);
      }
    } catch (err) {
      // AbortError는 의도적인 중단이므로 에러로 처리하지 않음
      if (err instanceof Error && err.name === "AbortError") {
        console.log("Stream aborted by user");
        return;
      }

      const error =
        err instanceof Error
          ? err
          : new Error("알 수 없는 오류가 발생했습니다.");
      setError(error.message);
      setStreamingStatus("error");
      setIsStreaming(false);
      onError?.(error);
    }
  }, [
    url,
    method,
    headers,
    inputData,
    onChunk,
    onComplete,
    onError,
    isStreaming,
    API_BASE_URL,
  ]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }

    setIsStreaming(false);
    setStreamingStatus("idle");
  }, []);

  const clearChunks = () => {
    setChunks([]);
  };

  const resetStream = () => {
    stopStreaming();
    setError(null);
    setChunks([]);
    setStreamingStatus("idle");
  };

  useEffect(() => {
    if (autoStart) {
      startStreaming();
    }

    return () => {
      stopStreaming();
    };
  }, [autoStart, startStreaming, stopStreaming]);

  const getStatusColor = () => {
    switch (streamingStatus) {
      case "streaming":
        return "text-blue-500";
      case "connecting":
        return "text-yellow-500";
      case "completed":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = () => {
    switch (streamingStatus) {
      case "streaming":
        return "스트리밍 중";
      case "connecting":
        return "연결 중...";
      case "completed":
        return "완료됨";
      case "error":
        return "오류";
      default:
        return "대기 중";
    }
  };

  const handleInputChange = (value: string) => {
    setInputData(value);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          스트리밍 연결
        </h2>
        <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
          <div
            className={`w-3 h-3 rounded-full ${
              streamingStatus === "streaming"
                ? "bg-blue-500 animate-pulse"
                : streamingStatus === "completed"
                ? "bg-green-500"
                : streamingStatus === "error"
                ? "bg-red-500"
                : "bg-gray-400"
            }`}
          ></div>
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
      </div>

      {/* 요청 데이터 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          요청 데이터 ({method})
        </label>
        <textarea
          value={inputData}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={isStreaming}
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono text-sm"
          placeholder="JSON 형태의 요청 데이터를 입력하세요"
        />
      </div>

      <div className="flex space-x-3 mb-4">
        <button
          onClick={startStreaming}
          disabled={isStreaming}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming ? "스트리밍 중..." : "스트리밍 시작"}
        </button>
        <button
          onClick={stopStreaming}
          disabled={!isStreaming}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          중단
        </button>
        <button
          onClick={resetStream}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          초기화
        </button>
        <button
          onClick={clearChunks}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          출력 초기화
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            스트리밍 청크 ({chunks.length})
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            총 길이:{" "}
            {chunks.reduce((sum, chunk) => sum + chunk.content.length, 0)} 문자
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          {chunks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              아직 받은 데이터가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {chunks.map((chunk, index) => (
                <div
                  key={chunk.id}
                  className="p-3 bg-white dark:bg-gray-600 rounded border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      청크 #{index + 1} ({chunk.content.length} 문자)
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chunk.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {chunk.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 전체 결과 미리보기 */}
        {chunks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              전체 결과
            </h4>
            <div className="max-h-48 overflow-y-auto bg-gray-100 dark:bg-gray-600 p-3 rounded-md">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {chunks.map((chunk) => chunk.content).join("")}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
