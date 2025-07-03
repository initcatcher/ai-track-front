'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface LayoutContextType {
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [showSidebar, setShowSidebar] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <LayoutContext.Provider
      value={{
        showSidebar,
        setShowSidebar,
        isSidebarOpen,
        setIsSidebarOpen,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
} 