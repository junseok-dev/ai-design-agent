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

export interface DesignTheme {
  primaryColor: string
  backgroundColor: string
  textColor: string
  secondaryColor?: string
  fontFamily: string
  fontSize?: {
    base: number
    heading: number
  }
}

export interface DesignLayout {
  width: string
  height?: string
  padding: string
  columns?: number
}

export interface HeroProps {
  title: string
  subtitle?: string
  description?: string
  avatarUrl?: string
  tags?: string[]
}

export interface TextBlockProps {
  heading?: string
  body: string
}

export interface SkillListProps {
  heading?: string
  skills: Array<{
    name: string
    level?: number
    category?: string
  }>
  displayStyle?: 'tags' | 'bars' | 'dots'
}

export interface TimelineProps {
  heading?: string
  items: Array<{
    period: string
    title: string
    organization: string
    description?: string
    tags?: string[]
  }>
}

export interface CardGridProps {
  heading?: string
  columns?: number
  cards: Array<{
    title: string
    subtitle?: string
    description?: string
    tags?: string[]
    link?: string
    imageUrl?: string
  }>
}

export interface DividerProps {
  style?: 'line' | 'space' | 'dots'
  margin?: number
}

export interface ContactInfoProps {
  heading?: string
  items: Array<{
    type: 'email' | 'phone' | 'github' | 'linkedin' | 'website' | 'location'
    value: string
    label?: string
  }>
  layout?: 'horizontal' | 'vertical'
}

export type SectionProps =
  | HeroProps
  | TextBlockProps
  | SkillListProps
  | TimelineProps
  | CardGridProps
  | DividerProps
  | ContactInfoProps

export interface DesignSection {
  id: string
  type: SectionType
  props: SectionProps
  style?: {
    align?: 'left' | 'center' | 'right'
    background?: string
    padding?: string
    marginBottom?: number
  }
}

export type PageType = 'a4-resume' | 'a4-document' | 'portfolio' | 'landing'

export interface DesignJSON {
  page: {
    type: PageType
    theme: DesignTheme
    layout: DesignLayout
    sections: DesignSection[]
  }
}

export interface SavedDocument {
  id: string
  name: string
  design: DesignJSON
  createdAt: number
  updatedAt: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isLoading?: boolean
}
