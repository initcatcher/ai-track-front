import { nanoid } from "nanoid";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
  count: number;
}

// 4글자 길이의 sessionId 생성
export const generateSessionId = (): string => {
  return nanoid(4);
};

// 로컬스토리지에서 sessionId 가져오기
export const getSessionId = (): string => {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem("chat_session_id");
  if (stored) {
    return stored;
  }

  // 새로운 sessionId 생성 및 저장
  const newSessionId = generateSessionId();
  localStorage.setItem("chat_session_id", newSessionId);
  return newSessionId;
};

// 로컬스토리지에 메시지 저장
export const saveMessagesToLocal = (
  sessionId: string,
  messages: ChatMessage[]
): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(`chat_messages_${sessionId}`, JSON.stringify(messages));
};

// 로컬스토리지에서 메시지 가져오기
export const getMessagesFromLocal = (sessionId: string): ChatMessage[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(`chat_messages_${sessionId}`);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// 세션스토리지에 임시 메시지 저장
export const saveTempMessage = (message: string): void => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("temp_message", message);
};

// 세션스토리지에서 임시 메시지 가져오기
export const getTempMessage = (): string => {
  if (typeof window === "undefined") return "";

  return sessionStorage.getItem("temp_message") || "";
};

// 세션스토리지에서 임시 메시지 삭제
export const clearTempMessage = (): void => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("temp_message");
};
