// ============================================================
// Lumio Design JSON 타입 시스템
// AI는 이 구조를 생성/수정하고, React 엔진이 화면을 렌더링한다
// ============================================================

// --- 섹션 타입 목록 ---
export type SectionType =
  | 'hero'
  | 'text-block'
  | 'skill-list'
  | 'timeline'
  | 'card-grid'
  | 'divider'
  | 'image-block'
  | 'project-card'
  | 'stats-card'
  | 'contact-info'

// --- 테마 (색상, 폰트 등 전역 스타일) ---
export interface DesignTheme {
  primaryColor: string       // 주요 강조 색상 (예: "#2563EB")
  backgroundColor: string    // 배경색
  textColor: string          // 기본 텍스트 색상
  secondaryColor?: string    // 보조 색상
  fontFamily: string         // 폰트 (예: "Inter")
  fontSize?: {
    base: number             // 기본 폰트 크기 (px)
    heading: number
  }
}

// --- 레이아웃 설정 ---
export interface DesignLayout {
  width: string              // 예: "210mm" (A4) 또는 "100%"
  height?: string            // 예: "297mm"
  padding: string            // 예: "16mm"
  columns?: number           // 다단 레이아웃
}

// --- hero 섹션 props ---
export interface HeroProps {
  title: string              // 이름 또는 제목
  subtitle?: string          // 직함 또는 부제목
  description?: string       // 한 줄 소개
  avatarUrl?: string         // 프로필 이미지 URL
  tags?: string[]            // 태그 목록
}

// --- text-block 섹션 props ---
export interface TextBlockProps {
  heading?: string           // 섹션 제목
  body: string               // 본문 텍스트
}

// --- skill-list 섹션 props ---
export interface SkillListProps {
  heading?: string
  skills: Array<{
    name: string
    level?: number           // 0~100 숙련도
    category?: string
  }>
  displayStyle?: 'tags' | 'bars' | 'dots'
}

// --- timeline 섹션 props (경력/학력) ---
export interface TimelineProps {
  heading?: string
  items: Array<{
    period: string           // 예: "2021.03 ~ 현재"
    title: string            // 직책 또는 학위
    organization: string     // 회사 또는 학교
    description?: string
    tags?: string[]
  }>
}

// --- card-grid 섹션 props ---
export interface CardGridProps {
  heading?: string
  columns?: number           // 열 개수 (기본 2)
  cards: Array<{
    title: string
    subtitle?: string
    description?: string
    tags?: string[]
    link?: string
    imageUrl?: string
  }>
}

// --- divider 섹션 props ---
export interface DividerProps {
  style?: 'line' | 'space' | 'dots'
  margin?: number
}

// --- contact-info 섹션 props ---
export interface ContactInfoProps {
  heading?: string
  items: Array<{
    type: 'email' | 'phone' | 'github' | 'linkedin' | 'website' | 'location'
    value: string
    label?: string
  }>
  layout?: 'horizontal' | 'vertical'
}

// --- 섹션별 props 유니온 타입 ---
export type SectionProps =
  | HeroProps
  | TextBlockProps
  | SkillListProps
  | TimelineProps
  | CardGridProps
  | DividerProps
  | ContactInfoProps

// --- 개별 섹션 ---
export interface DesignSection {
  id: string                 // 고유 식별자 (예: "header", "skills")
  type: SectionType
  props: SectionProps
  style?: {
    align?: 'left' | 'center' | 'right'
    background?: string
    padding?: string
    marginBottom?: number
  }
}

// --- 페이지 타입 ---
export type PageType = 'a4-resume' | 'a4-document' | 'portfolio' | 'landing'

// --- 최상위 DesignJSON ---
export interface DesignJSON {
  page: {
    type: PageType
    theme: DesignTheme
    layout: DesignLayout
    sections: DesignSection[]
  }
}

// --- 저장된 문서 (localStorage에 유지됨) ---
export interface SavedDocument {
  id: string
  name: string             // 예: "이력서", "포트폴리오 2"
  design: DesignJSON
  createdAt: number
  updatedAt: number
}

// --- 채팅 메시지 ---
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isLoading?: boolean        // AI 응답 대기 중 표시용
}
