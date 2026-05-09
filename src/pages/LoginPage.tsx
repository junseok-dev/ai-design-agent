// 로그인 페이지 — Google / 네이버 OAuth

import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export function LoginPage() {
  const { signInWithGoogle, signInWithGithub, signInWithDiscord, signInWithNaver } = useAuthStore()
  const [loading, setLoading] = useState<'google' | 'github' | 'discord' | 'naver' | null>(null)

  async function handleGoogle() {
    setLoading('google')
    await signInWithGoogle()
    setLoading(null)
  }

  async function handleGithub() {
    setLoading('github')
    await signInWithGithub()
    setLoading(null)
  }

  async function handleDiscord() {
    setLoading('discord')
    await signInWithDiscord()
    setLoading(null)
  }

  function handleNaver() {
    setLoading('naver')
    signInWithNaver()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* 로고 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lumio</h1>
          <p className="text-gray-500 text-sm mt-1">AI 기반 대화형 디자인 플랫폼</p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 p-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">시작하기</h2>
          <p className="text-sm text-gray-500 mb-6">소셜 계정으로 바로 로그인하세요</p>

          <div className="space-y-3">
            {/* Google 로그인 */}
            <button
              onClick={handleGoogle}
              disabled={!!loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Google로 시작하기
            </button>

            {/* GitHub 로그인 */}
            <button
              onClick={handleGithub}
              disabled={!!loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === 'github' ? (
                <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              )}
              GitHub으로 시작하기
            </button>

            {/* Discord 로그인 */}
            <button
              onClick={handleDiscord}
              disabled={!!loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#5865F2' }}
            >
              {loading === 'discord' ? (
                <div className="w-5 h-5 border-2 border-indigo-300 border-t-white rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                </svg>
              )}
              Discord로 시작하기
            </button>

            {/* 네이버 로그인 */}
            <button
              onClick={handleNaver}
              disabled={!!loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#03C75A' }}
            >
              {loading === 'naver' ? (
                <div className="w-5 h-5 border-2 border-green-300 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="w-5 h-5 flex items-center justify-center font-extrabold text-base leading-none">
                  N
                </span>
              )}
              네이버로 시작하기
            </button>
          </div>

          {/* 안내 */}
          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
            로그인 시 이용약관 및 개인정보처리방침에<br />동의하는 것으로 간주합니다.
          </p>
        </div>

        {/* 하단 설명 */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '💬', text: '대화형 AI 디자인' },
            { icon: '📄', text: '이력서 · 포트폴리오' },
            { icon: '☁️', text: '클라우드 자동 저장' },
          ].map(item => (
            <div key={item.text}>
              <div className="text-xl mb-1">{item.icon}</div>
              <p className="text-xs text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
