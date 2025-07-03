// 각각의 세션마다 채팅 페이지 렌더링
// 세션마다의 기록은 로컬스토리지에 저장함.

import { ChatApp } from "@/features/chat";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return <ChatApp id={id} />;
}
