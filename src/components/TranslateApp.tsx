'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface Language {
  code: string
  name: string
}

const LANGUAGES: Language[] = [
  { code: 'Korean', name: '한국어' },
  { code: 'English', name: 'English' },
  { code: 'Japanese', name: '日本語' },
  { code: 'Chinese', name: '中문' },
  { code: 'French', name: 'Français' },
  { code: 'German', name: 'Deutsch' },
  { code: 'Spanish', name: 'Español' },
  { code: 'Russian', name: 'Русский' },
]

export default function TranslateApp() {
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('Korean')
  const [targetLanguage, setTargetLanguage] = useState('English')
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const translateText = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    setError(null)
    setTranslatedText('')

    // 기존 요청 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`${API_BASE_URL}/api/translate/stream-sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText.trim(),
          source_language: sourceLanguage,
          target_language: targetLanguage,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data && data !== '[DONE]') {
              result += data
              setTranslatedText(result)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Translation aborted')
      } else {
        const error =
          err instanceof Error ? err : new Error('번역 중 오류가 발생했습니다.')
        setError(error.message)
        console.error('Translation error:', error)
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const clearAll = () => {
    setInputText('')
    setTranslatedText('')
    setError(null)
  }

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setInputText(translatedText)
    setTranslatedText('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      translateText()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Link
              href="/"
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="홈으로"
            >
              ← 홈
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI 실시간 번역기
            </h1>
          </div>

          {/* 언어 선택 */}
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                원본 언어:
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={swapLanguages}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="언어 전환"
            >
              ⇄
            </button>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                번역 언어:
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 번역 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 영역 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                원본 텍스트
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sourceLanguage}
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="번역할 텍스트를 입력하세요..."
              className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} 문자
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={translateText}
                  disabled={!inputText.trim() || isTranslating}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTranslating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>번역 중...</span>
                    </div>
                  ) : (
                    '번역하기'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 출력 영역 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                번역 결과
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {targetLanguage}
              </span>
            </div>
            <div className="w-full h-48 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 overflow-y-auto">
              {error ? (
                <div className="text-red-500 dark:text-red-400 text-center mt-16">
                  <div className="text-2xl mb-2">⚠️</div>
                  <p>{error}</p>
                </div>
              ) : translatedText ? (
                <div className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {translatedText}
                </div>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center mt-16">
                  {isTranslating ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
                      <p>번역 중...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">🌍</div>
                      <p>번역 결과가 여기에 표시됩니다</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {translatedText.length} 문자
              </span>
              {translatedText && (
                <button
                  onClick={() => navigator.clipboard.writeText(translatedText)}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  복사하기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            사용법
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <strong>• 텍스트 입력:</strong> 왼쪽 영역에 번역할 텍스트를
              입력하세요
            </div>
            <div>
              <strong>• 언어 선택:</strong> 원본 언어와 번역할 언어를 선택하세요
            </div>
            <div>
              <strong>• 번역 실행:</strong> &quot;번역하기&quot; 버튼을
              클릭하거나 Enter 키를 누르세요
            </div>
            <div>
              <strong>• 언어 전환:</strong> ⇄ 버튼으로 원본/번역 언어를 바꿀 수
              있습니다
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
