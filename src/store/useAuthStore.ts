// ============================================================
// 인증 상태 관리
// Google / 네이버 OAuth, 로그아웃, 세션 초기화
// ============================================================

import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchDocuments, bulkUpsert } from '../services/documentService'
import { useDesignStore } from './useDesignStore'

interface AuthStore {
  user: User | null
  session: Session | null
  isLoading: boolean

  // 앱 시작 시 한 번 호출 — 세션 복원 + 리스너 등록
  initialize: () => Promise<void>

  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signInWithDiscord: () => Promise<void>
  signInWithNaver: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  initialize: async () => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth] event:', _event, '/ user:', session?.user?.email ?? null)
      set({ session, user: session?.user ?? null, isLoading: false })
      if (session) await syncDocuments()
    })

    const { data: { session } } = await supabase.auth.getSession()
    console.log('[Auth] getSession:', session?.user?.email ?? null)
    set({ session, user: session?.user ?? null, isLoading: false })
    if (session) await syncDocuments()
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    })
  },

  signInWithGithub: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
  },

  signInWithDiscord: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin },
    })
  },

  signInWithNaver: () => {
    const clientId   = import.meta.env.VITE_NAVER_CLIENT_ID
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    // 네이버 콜백은 Supabase Edge Function이 처리한다
    const redirectUri = `${supabaseUrl}/functions/v1/naver-auth`
    const state = crypto.randomUUID()
    sessionStorage.setItem('naver_oauth_state', state)

    const url = new URL('https://nid.naver.com/oauth2.0/authorize')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('state', state)

    window.location.href = url.toString()
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
    // 로컬 문서 초기화 (선택 — 개인 정보 보호)
    useDesignStore.getState().clearAll()
  },
}))

// 로그인 후 클라우드 ↔ 로컬 문서 동기화
async function syncDocuments() {
  const cloudDocs = await fetchDocuments()
  const store = useDesignStore.getState()

  if (cloudDocs.length > 0) {
    // 클라우드 데이터가 있으면 클라우드 기준으로 교체
    store.setDocumentsFromCloud(cloudDocs)
  } else {
    // 클라우드가 비어있으면 로컬 → 클라우드 업로드 (첫 로그인)
    const localDocs = store.documents
    if (localDocs.length > 0) await bulkUpsert(localDocs)
  }
}
