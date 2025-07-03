export interface Message {
  id: string
  text: string
  timestamp: Date
  isUser: boolean
  isLoading?: boolean
}

export interface Language {
  code: string
  name: string
}

export const LANGUAGES: Language[] = [
  { code: 'Korean', name: '한국어' },
  { code: 'English', name: 'English' },
  { code: 'Japanese', name: '日본語' },
  { code: 'Chinese', name: '中문' },
  { code: 'French', name: 'Français' },
  { code: 'German', name: 'Deutsch' },
  { code: 'Spanish', name: 'Español' },
  { code: 'Russian', name: 'Русский' },
]
