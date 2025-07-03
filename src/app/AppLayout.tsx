'use client'

import { LayoutProvider, useLayout } from '@/components/LayoutContext'
import { Sidebar } from '@/components/Sidebar'

interface AppLayoutContentProps {
  children: React.ReactNode
}

const AppLayoutContent = ({ children }: AppLayoutContentProps) => {
  const { showSidebar, isSidebarOpen, setIsSidebarOpen } = useLayout()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (!showSidebar) {
    // 사이드바가 필요 없는 페이지 (홈페이지 등)
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 사이드바 */}
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* 상단 헤더 바 (모바일용) */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-lg">💕</span>
            <span className="font-semibold text-gray-900 dark:text-white">연애인 유재석</span>
          </div>
          <div className="w-10" /> {/* 균형을 위한 빈 공간 */}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <LayoutProvider>
      <AppLayoutContent>
        {children}
      </AppLayoutContent>
    </LayoutProvider>
  )
} 