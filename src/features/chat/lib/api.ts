import { ChatMessage, ChatSession } from "./session";

// 세션 히스토리 조회
export const fetchSessionHistory = async (
  sessionId: string
): Promise<ChatSession | null> => {
  try {
    const response = await fetch(`/api/history/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // 세션이 없는 경우 null 반환
        return null;
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("세션 히스토리 조회 실패:", error);
    return null;
  }
};

// 새로운 메시지 전송
export const sendMessage = async (
  sessionId: string,
  message: string
): Promise<ChatMessage | null> => {
  try {
    const response = await fetch(`/api/chat/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        timestamp: Date.now() / 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("메시지 전송 실패:", error);
    return null;
  }
};

// 메시지 동기화 (로컬스토리지와 서버 동기화)
export const syncMessages = async (
  sessionId: string,
  localMessages: ChatMessage[]
): Promise<ChatMessage[]> => {
  try {
    const serverData = await fetchSessionHistory(sessionId);

    if (!serverData) {
      // 서버에 세션이 없는 경우 로컬 메시지 반환
      return localMessages;
    }

    const serverMessages = serverData.messages;

    // 서버 메시지가 더 최신인지 확인 (타임스탬프 기준)
    const localLastTimestamp =
      localMessages.length > 0
        ? localMessages[localMessages.length - 1].timestamp
        : 0;
    const serverLastTimestamp =
      serverMessages.length > 0
        ? serverMessages[serverMessages.length - 1].timestamp
        : 0;

    if (serverLastTimestamp > localLastTimestamp) {
      // 서버 메시지가 더 최신인 경우 서버 메시지 사용
      return serverMessages;
    } else {
      // 로컬 메시지가 더 최신이거나 같은 경우 로컬 메시지 사용
      return localMessages;
    }
  } catch (error) {
    console.error("메시지 동기화 실패:", error);
    return localMessages;
  }
};
