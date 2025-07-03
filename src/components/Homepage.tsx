"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSessionId,
  getMessagesFromLocal,
  saveMessagesToLocal,
  saveTempMessage,
  getTempMessage,
} from "@/features/chat/lib/session";
import { syncMessages } from "@/features/chat/lib/api";

export const Homepage = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 컴포넌트 마운트 시 sessionId 확인 및 생성
    const sessionId = getSessionId();
    console.log("Current sessionId:", sessionId);

    // 임시 메시지가 있는지 확인 (새로고침 등으로 돌아온 경우)
    const tempMessage = getTempMessage();
    if (tempMessage) {
      setMessage(tempMessage);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    setIsLoading(true);

    try {
      const sessionId = getSessionId();

      // 1. 임시 메시지 저장
      saveTempMessage(message);

      // 2. 로컬 메시지 가져오기
      const localMessages = getMessagesFromLocal(sessionId);

      // 3. 서버와 동기화
      const syncedMessages = await syncMessages(sessionId, localMessages);

      // 4. 동기화된 메시지를 로컬에 저장
      saveMessagesToLocal(sessionId, syncedMessages);

      // 5. 채팅 페이지로 이동 (임시 메시지는 채팅 페이지에서 처리)
      router.push(`/chat/${sessionId}`);
    } catch (error) {
      console.error("메시지 제출 실패:", error);
      alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQuestions = [
    "오늘 하루는 어땠어?",
    "요즘 어떤 일로 바빠?",
    "주말에 뭐 하고 싶어?",
    "좋아하는 음식이 뭐야?",
    "스트레스 받을 때는 어떻게 해?",
    "꿈이 뭐야?",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* 헤더 영역 */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💕</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            연애인 유재석
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            국민 MC와 편안하고 재미있는 대화를 나눠보세요
          </p>
        </div>

        {/* 메인 입력 영역 */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="유재석에게 하고 싶은 말을 적어보세요..."
                className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl 
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                         resize-none min-h-[120px] text-base
                                         placeholder-gray-500 dark:placeholder-gray-400"
                rows={4}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="absolute bottom-3 right-3 p-2 bg-blue-500 hover:bg-blue-600 
                                         disabled:bg-gray-300 disabled:cursor-not-allowed
                                         text-white rounded-lg transition-colors duration-200"
              >
                {isLoading ? (
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 예시 질문들 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            이런 것들을 물어보세요
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exampleQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="p-3 text-left bg-white dark:bg-gray-800 rounded-lg 
                                         border border-gray-200 dark:border-gray-700
                                         hover:bg-gray-50 dark:hover:bg-gray-700
                                         transition-colors duration-200 text-sm
                                         text-gray-700 dark:text-gray-300"
              >
                &quot;{question}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🎤</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  자연스러운 대화
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  유재석의 말투와 유머로 대화
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">😊</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  긍정적인 에너지
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  따뜻하고 유쾌한 대화 상대
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💝</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  연애 상담
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  경험 많은 MC의 조언
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
