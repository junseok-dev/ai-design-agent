import { create } from 'zustand'
import type { ChatMessage, DesignJSON, SavedDocument } from '../types/design'
import * as docService from '../services/documentService'

const MAX_HISTORY = 30
const STORAGE_KEY = 'lumio_documents'
const ACTIVE_DOCUMENT_KEY = 'lumio_active_document_id'
const EDIT_MESSAGES_KEY = 'lumio_edit_messages'
const DISCUSS_MESSAGES_KEY = 'lumio_discuss_messages'

const initialEditMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: '안녕하세요. Lumio입니다.\n\n채팅으로 이력서와 포트폴리오를 만들고 수정할 수 있어요.',
    timestamp: Date.now(),
  },
]

const initialDiscussMessages: ChatMessage[] = [
  {
    id: 'discuss-welcome',
    role: 'assistant',
    content: 'Discuss mode입니다. 현재 디자인을 기준으로 구조, 내용, 톤, 시각적 완성도에 대해 함께 이야기할 수 있어요. 이 모드에서는 디자인을 자동으로 바꾸지 않습니다.',
    timestamp: Date.now(),
  },
]

function loadDocuments(): SavedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedDocument[]) : []
  } catch {
    return []
  }
}

function persistDocuments(docs: SavedDocument[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
  } catch {
    // Ignore localStorage quota errors.
  }
}

function loadMessages(key: string, fallback: ChatMessage[]): ChatMessage[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ChatMessage[]) : fallback
  } catch {
    return fallback
  }
}

function persistMessages(key: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(key, JSON.stringify(messages))
  } catch {
    // Ignore localStorage quota errors.
  }
}

function loadActiveDocumentId(docs: SavedDocument[]): string | null {
  const stored = localStorage.getItem(ACTIVE_DOCUMENT_KEY)
  if (stored && docs.some(doc => doc.id === stored)) return stored
  return docs[0]?.id ?? null
}

function persistActiveDocumentId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_DOCUMENT_KEY, id)
  else localStorage.removeItem(ACTIVE_DOCUMENT_KEY)
}

function defaultDocName(design: DesignJSON, existingDocs: SavedDocument[]): string {
  const baseName =
    design.page.type === 'a4-resume' ? '이력서' :
    design.page.type === 'portfolio' ? '포트폴리오' : '문서'

  const sameType = existingDocs.filter(doc => doc.name.startsWith(baseName))
  return sameType.length === 0 ? baseName : `${baseName} ${sameType.length + 1}`
}

interface DesignStore {
  design: DesignJSON | null
  documents: SavedDocument[]
  activeDocumentId: string | null
  history: DesignJSON[]
  future: DesignJSON[]
  messages: ChatMessage[]
  discussMessages: ChatMessage[]
  isProcessing: boolean

  setDesign: (design: DesignJSON) => void
  saveAsNewDocument: (design: DesignJSON) => void
  openDocument: (id: string) => void
  deleteDocument: (id: string) => void
  renameDocument: (id: string, name: string) => void

  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  addMessage: (message: ChatMessage) => void
  updateLastMessage: (content: string, isLoading?: boolean) => void
  addDiscussMessage: (message: ChatMessage) => void
  updateLastDiscussMessage: (content: string, isLoading?: boolean) => void
  setProcessing: (value: boolean) => void

  setDocumentsFromCloud: (docs: SavedDocument[]) => void
  clearAll: () => void
}

const initialDocuments = loadDocuments()
const initialActiveId = loadActiveDocumentId(initialDocuments)
const initialDesign = initialDocuments.find(doc => doc.id === initialActiveId)?.design ?? null

export const useDesignStore = create<DesignStore>((set, get) => ({
  design: initialDesign,
  documents: initialDocuments,
  activeDocumentId: initialActiveId,
  history: [],
  future: [],
  messages: loadMessages(EDIT_MESSAGES_KEY, initialEditMessages),
  discussMessages: loadMessages(DISCUSS_MESSAGES_KEY, initialDiscussMessages),
  isProcessing: false,

  setDesign: (design) => {
    const { design: current, activeDocumentId, documents } = get()
    let nextActiveDocumentId = activeDocumentId
    let newDocuments: SavedDocument[]

    if (activeDocumentId) {
      newDocuments = documents.map(doc =>
        doc.id === activeDocumentId
          ? { ...doc, design, updatedAt: Date.now() }
          : doc
      )
    } else {
      const newDoc: SavedDocument = {
        id: crypto.randomUUID(),
        name: defaultDocName(design, documents),
        design,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      nextActiveDocumentId = newDoc.id
      newDocuments = [newDoc, ...documents]
    }

    persistDocuments(newDocuments)
    persistActiveDocumentId(nextActiveDocumentId)

    const updatedDoc = newDocuments.find(doc => doc.id === nextActiveDocumentId)
    if (updatedDoc) docService.upsertDocument(updatedDoc).catch(() => null)

    set(state => ({
      design,
      documents: newDocuments,
      activeDocumentId: nextActiveDocumentId,
      history: current ? [...state.history.slice(-MAX_HISTORY + 1), current] : state.history,
      future: [],
    }))
  },

  saveAsNewDocument: (design) => {
    const { documents } = get()
    const newDoc: SavedDocument = {
      id: crypto.randomUUID(),
      name: defaultDocName(design, documents),
      design,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const newDocuments = [newDoc, ...documents]

    persistDocuments(newDocuments)
    persistActiveDocumentId(newDoc.id)
    docService.upsertDocument(newDoc).catch(() => null)

    set({
      documents: newDocuments,
      activeDocumentId: newDoc.id,
      design,
      history: [],
      future: [],
    })
  },

  openDocument: (id) => {
    const doc = get().documents.find(item => item.id === id)
    if (!doc) return

    persistActiveDocumentId(id)
    set({ design: doc.design, activeDocumentId: id, history: [], future: [] })
  },

  deleteDocument: (id) => {
    const { documents, activeDocumentId } = get()
    const newDocuments = documents.filter(doc => doc.id !== id)
    persistDocuments(newDocuments)
    docService.removeDocument(id).catch(() => null)

    if (activeDocumentId === id) {
      const next = newDocuments[0] ?? null
      persistActiveDocumentId(next?.id ?? null)
      set({
        documents: newDocuments,
        design: next?.design ?? null,
        activeDocumentId: next?.id ?? null,
        history: [],
        future: [],
      })
      return
    }

    set({ documents: newDocuments })
  },

  renameDocument: (id, name) => {
    const newDocuments = get().documents.map(doc => doc.id === id ? { ...doc, name } : doc)
    persistDocuments(newDocuments)
    const updated = newDocuments.find(doc => doc.id === id)
    if (updated) docService.upsertDocument(updated).catch(() => null)
    set({ documents: newDocuments })
  },

  undo: () => {
    const { history, design, activeDocumentId, documents } = get()
    if (history.length === 0) return

    const previous = history[history.length - 1]
    const newDocuments = activeDocumentId
      ? documents.map(doc => doc.id === activeDocumentId ? { ...doc, design: previous, updatedAt: Date.now() } : doc)
      : documents

    persistDocuments(newDocuments)
    set(state => ({
      design: previous,
      documents: newDocuments,
      history: state.history.slice(0, -1),
      future: design ? [design, ...state.future] : state.future,
    }))
  },

  redo: () => {
    const { future, design, activeDocumentId, documents } = get()
    if (future.length === 0) return

    const next = future[0]
    const newDocuments = activeDocumentId
      ? documents.map(doc => doc.id === activeDocumentId ? { ...doc, design: next, updatedAt: Date.now() } : doc)
      : documents

    persistDocuments(newDocuments)
    set(state => ({
      design: next,
      documents: newDocuments,
      future: state.future.slice(1),
      history: design ? [...state.history, design] : state.history,
    }))
  },

  canUndo: () => get().history.length > 0,
  canRedo: () => get().future.length > 0,

  addMessage: (message) => set(state => {
    const messages = [...state.messages, message]
    persistMessages(EDIT_MESSAGES_KEY, messages)
    return { messages }
  }),

  updateLastMessage: (content, isLoading = false) => {
    set(state => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last && last.role === 'assistant') {
        messages[messages.length - 1] = { ...last, content, isLoading }
      }
      persistMessages(EDIT_MESSAGES_KEY, messages)
      return { messages }
    })
  },

  addDiscussMessage: (message) => set(state => {
    const discussMessages = [...state.discussMessages, message]
    persistMessages(DISCUSS_MESSAGES_KEY, discussMessages)
    return { discussMessages }
  }),

  updateLastDiscussMessage: (content, isLoading = false) => {
    set(state => {
      const discussMessages = [...state.discussMessages]
      const last = discussMessages[discussMessages.length - 1]
      if (last && last.role === 'assistant') {
        discussMessages[discussMessages.length - 1] = { ...last, content, isLoading }
      }
      persistMessages(DISCUSS_MESSAGES_KEY, discussMessages)
      return { discussMessages }
    })
  },

  setProcessing: (value) => set({ isProcessing: value }),

  setDocumentsFromCloud: (docs) => {
    persistDocuments(docs)
    const first = docs[0] ?? null
    persistActiveDocumentId(first?.id ?? null)
    set({
      documents: docs,
      activeDocumentId: first?.id ?? null,
      design: first?.design ?? null,
      history: [],
      future: [],
    })
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(ACTIVE_DOCUMENT_KEY)
    localStorage.removeItem(EDIT_MESSAGES_KEY)
    localStorage.removeItem(DISCUSS_MESSAGES_KEY)
    set({
      documents: [],
      activeDocumentId: null,
      design: null,
      history: [],
      future: [],
      messages: initialEditMessages,
      discussMessages: initialDiscussMessages,
    })
  },
}))
