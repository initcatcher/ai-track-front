'use client'

import { SSEConnection, StreamingConnection } from '@/components'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI 번역 스트리밍 테스트
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            SSE 연결과 스트리밍 연결을 테스트할 수 있는 데모 페이지입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* SSE 연결 컴포넌트 */}
          <div className="w-full">
            <SSEConnection
              url="/api/translate/stream-sse"
              onMessage={(data) => {
                console.log('SSE 메시지 수신:', data)
              }}
              onError={(error) => {
                console.error('SSE 오류:', error)
              }}
              onOpen={() => {
                console.log('SSE 연결 열림')
              }}
              onClose={() => {
                console.log('SSE 연결 닫힘')
              }}
            />
          </div>

          {/* 스트리밍 연결 컴포넌트 */}
          <div className="w-full">
            <StreamingConnection
              url="/api/translate/stream"
              method="POST"
              headers={{
                'Content-Type': 'application/json',
              }}
              onChunk={(chunk) => {
                console.log('스트리밍 청크 수신:', chunk)
              }}
              onComplete={() => {
                console.log('스트리밍 완료')
              }}
              onError={(error) => {
                console.error('스트리밍 오류:', error)
              }}
            />
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            사용법
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                SSE 연결
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Server-Sent Events를 사용한 실시간 데이터 수신</li>
                <li>자동 재연결 기능 (최대 5회 시도)</li>
                <li>연결 상태 표시</li>
                <li>수신된 메시지 히스토리</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                스트리밍 연결
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                <li>Fetch API를 사용한 스트리밍 데이터 수신</li>
                <li>POST 요청으로 데이터 전송</li>
                <li>실시간 청크별 데이터 표시</li>
                <li>요청 중단 및 초기화 기능</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API 엔드포인트 정보 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4">
            API 엔드포인트
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="text-blue-800 dark:text-blue-300">
              <strong>SSE:</strong> POST{' '}
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              /api/translate/stream-sse
            </div>
            <div className="text-blue-800 dark:text-blue-300">
              <strong>스트리밍:</strong> POST{' '}
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              /api/translate/stream
            </div>
          </div>
          <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
            환경변수 NEXT_PUBLIC_API_URL을 설정하여 API 서버 URL을 변경할 수
            있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
