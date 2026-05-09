import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { SharePage } from './pages/SharePage'
import { useAuthStore } from './store/useAuthStore'

function App() {
  const { initialize, user, isLoading } = useAuthStore()
  const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/)

  useEffect(() => {
    initialize()
  }, [])

  if (shareMatch) return <SharePage documentId={decodeURIComponent(shareMatch[1])} />

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <AppLayout />
}

export default App
