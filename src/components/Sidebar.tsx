'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ChatHistory {
  id: string
  title: string
  timestamp: string
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  // 더미 채팅 히스토리 데이터
  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: '연애 조언 부탁해요', timestamp: '2024-01-20' },
    { id: '2', title: '오늘 하루 어땠어요?', timestamp: '2024-01-19' },
    { id: '3', title: '스트레스 받을 때 어떻게 해요?', timestamp: '2024-01-18' },
    { id: '4', title: '주말 계획 있어요?', timestamp: '2024-01-17' },
    { id: '5', title: '좋아하는 음식이 뭐예요?', timestamp: '2024-01-16' },
  ])

  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // TODO: 실제 다크모드 토글 로직 구현
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-xl">💕</span>
              <span className="font-semibold">연애인 유재석</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-md hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 새 대화 버튼 */}
          <div className="p-4">
            <Link href="/">
              <button className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>새 대화</span>
              </button>
            </Link>
          </div>

          {/* 채팅 히스토리 */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">최근 대화</h3>
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <Link key={chat.id} href={`/chat/${chat.id}`}>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer group">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-blue-300">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {chat.timestamp}
                        </p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-700">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 하단 설정 영역 */}
          <div className="border-t border-gray-700 p-4">
            {/* 다크모드 토글 */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">다크 모드</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 사용자 정보 */}
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">사</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">사용자</p>
                <p className="text-xs text-gray-400">설정 및 도움말</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* 도움말 링크 */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex flex-col space-y-2 text-sm text-gray-400">
                <button className="text-left hover:text-white transition-colors">도움말</button>
                <button className="text-left hover:text-white transition-colors">피드백 보내기</button>
                <button className="text-left hover:text-white transition-colors">개인정보 처리방침</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}