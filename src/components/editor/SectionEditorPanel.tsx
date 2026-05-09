import { useEffect, useState } from 'react'
import type {
  CardGridProps,
  ContactInfoProps,
  DesignSection,
  DividerProps,
  HeroProps,
  SectionProps,
  SkillListProps,
  TextBlockProps,
  TimelineProps,
} from '../../types/design'

interface Props {
  section: DesignSection
  onUpdate: (props: SectionProps) => void
  onStyleUpdate: (style: DesignSection['style']) => void
  onDelete: () => void
  onClose: () => void
}

const sectionLabels: Record<DesignSection['type'], string> = {
  hero: '헤더',
  'text-block': '텍스트',
  'skill-list': '스킬',
  timeline: '타임라인',
  'card-grid': '카드',
  divider: '구분선',
  'image-block': '이미지',
  'project-card': '프로젝트',
  'stats-card': '지표',
  'contact-info': '연락처',
}

const inputClass = 'w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white'
const textareaClass = `${inputClass} resize-none`
const selectClass = inputClass

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  )
}

function csvToList(value: string) {
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

function HeroEditor({ props, onChange }: { props: HeroProps; onChange: (props: HeroProps) => void }) {
  return (
    <>
      <Field label="이름 / 제목">
        <input className={inputClass} value={props.title} onChange={event => onChange({ ...props, title: event.target.value })} />
      </Field>
      <Field label="부제목">
        <input className={inputClass} value={props.subtitle ?? ''} onChange={event => onChange({ ...props, subtitle: event.target.value })} />
      </Field>
      <Field label="소개">
        <textarea className={textareaClass} rows={3} value={props.description ?? ''} onChange={event => onChange({ ...props, description: event.target.value })} />
      </Field>
      <Field label="태그">
        <input className={inputClass} value={(props.tags ?? []).join(', ')} placeholder="React, TypeScript" onChange={event => onChange({ ...props, tags: csvToList(event.target.value) })} />
      </Field>
    </>
  )
}

function TextBlockEditor({ props, onChange }: { props: TextBlockProps; onChange: (props: TextBlockProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputClass} value={props.heading ?? ''} onChange={event => onChange({ ...props, heading: event.target.value })} />
      </Field>
      <Field label="본문">
        <textarea className={textareaClass} rows={5} value={props.body} onChange={event => onChange({ ...props, body: event.target.value })} />
      </Field>
    </>
  )
}

function SkillListEditor({ props, onChange }: { props: SkillListProps; onChange: (props: SkillListProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputClass} value={props.heading ?? ''} onChange={event => onChange({ ...props, heading: event.target.value })} />
      </Field>
      <Field label="표시 방식">
        <select className={selectClass} value={props.displayStyle ?? 'tags'} onChange={event => onChange({ ...props, displayStyle: event.target.value as SkillListProps['displayStyle'] })}>
          <option value="tags">태그</option>
          <option value="bars">막대 그래프</option>
        </select>
      </Field>
      <ListHeader title="스킬 목록" onAdd={() => onChange({ ...props, skills: [...props.skills, { name: '', level: 80 }] })} />
      <div className="space-y-2">
        {props.skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-2">
            <input
              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              value={skill.name}
              placeholder="스킬명"
              onChange={event => {
                const skills = [...props.skills]
                skills[index] = { ...skill, name: event.target.value }
                onChange({ ...props, skills })
              }}
            />
            {props.displayStyle === 'bars' && (
              <input
                type="number"
                min={0}
                max={100}
                className="w-14 px-2 py-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:border-blue-400"
                value={skill.level ?? 80}
                onChange={event => {
                  const skills = [...props.skills]
                  skills[index] = { ...skill, level: Number(event.target.value) }
                  onChange({ ...props, skills })
                }}
              />
            )}
            <IconButton label="삭제" onClick={() => onChange({ ...props, skills: props.skills.filter((_, itemIndex) => itemIndex !== index) })} />
          </div>
        ))}
      </div>
    </>
  )
}

function TimelineEditor({ props, onChange }: { props: TimelineProps; onChange: (props: TimelineProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputClass} value={props.heading ?? ''} onChange={event => onChange({ ...props, heading: event.target.value })} />
      </Field>
      <ListHeader title="항목" onAdd={() => onChange({ ...props, items: [...props.items, { period: '', title: '', organization: '' }] })} />
      <div className="space-y-3">
        {props.items.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">항목 {index + 1}</span>
              <button onClick={() => onChange({ ...props, items: props.items.filter((_, itemIndex) => itemIndex !== index) })} className="text-xs text-red-500 hover:text-red-600">삭제</button>
            </div>
            <div className="space-y-1.5">
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={item.period} placeholder="기간" onChange={event => updateTimelineItem(props, onChange, index, { period: event.target.value })} />
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={item.title} placeholder="제목" onChange={event => updateTimelineItem(props, onChange, index, { title: event.target.value })} />
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={item.organization ?? ''} placeholder="회사 / 학교" onChange={event => updateTimelineItem(props, onChange, index, { organization: event.target.value })} />
              <textarea className="w-full px-2 py-1 text-xs border border-gray-200 rounded resize-none focus:outline-none focus:border-blue-400" rows={2} value={item.description ?? ''} placeholder="설명" onChange={event => updateTimelineItem(props, onChange, index, { description: event.target.value })} />
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={(item.tags ?? []).join(', ')} placeholder="태그" onChange={event => updateTimelineItem(props, onChange, index, { tags: csvToList(event.target.value) })} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function CardGridEditor({ props, onChange }: { props: CardGridProps; onChange: (props: CardGridProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputClass} value={props.heading ?? ''} onChange={event => onChange({ ...props, heading: event.target.value })} />
      </Field>
      <Field label="열 수">
        <select className={selectClass} value={props.columns ?? 2} onChange={event => onChange({ ...props, columns: Number(event.target.value) as CardGridProps['columns'] })}>
          <option value={1}>1열</option>
          <option value={2}>2열</option>
          <option value={3}>3열</option>
        </select>
      </Field>
      <ListHeader title="카드 목록" onAdd={() => onChange({ ...props, cards: [...props.cards, { title: '' }] })} />
      <div className="space-y-3">
        {props.cards.map((card, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">카드 {index + 1}</span>
              <button onClick={() => onChange({ ...props, cards: props.cards.filter((_, itemIndex) => itemIndex !== index) })} className="text-xs text-red-500 hover:text-red-600">삭제</button>
            </div>
            <div className="space-y-1.5">
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={card.title} placeholder="제목" onChange={event => updateCard(props, onChange, index, { title: event.target.value })} />
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={card.subtitle ?? ''} placeholder="부제목" onChange={event => updateCard(props, onChange, index, { subtitle: event.target.value })} />
              <textarea className="w-full px-2 py-1 text-xs border border-gray-200 rounded resize-none focus:outline-none focus:border-blue-400" rows={2} value={card.description ?? ''} placeholder="설명" onChange={event => updateCard(props, onChange, index, { description: event.target.value })} />
              <input className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400" value={(card.tags ?? []).join(', ')} placeholder="태그" onChange={event => updateCard(props, onChange, index, { tags: csvToList(event.target.value) })} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function DividerEditor({ props, onChange }: { props: DividerProps; onChange: (props: DividerProps) => void }) {
  return (
    <>
      <Field label="스타일">
        <select className={selectClass} value={props.style ?? 'line'} onChange={event => onChange({ ...props, style: event.target.value as DividerProps['style'] })}>
          <option value="line">선</option>
          <option value="space">여백</option>
          <option value="dots">점</option>
        </select>
      </Field>
      <Field label="여백">
        <input type="number" className={inputClass} value={props.margin ?? 8} onChange={event => onChange({ ...props, margin: Number(event.target.value) })} />
      </Field>
    </>
  )
}

function ContactInfoEditor({ props, onChange }: { props: ContactInfoProps; onChange: (props: ContactInfoProps) => void }) {
  const types = ['email', 'phone', 'github', 'linkedin', 'website', 'location'] as const

  return (
    <>
      <Field label="제목">
        <input className={inputClass} value={props.heading ?? ''} onChange={event => onChange({ ...props, heading: event.target.value })} />
      </Field>
      <Field label="배치">
        <select className={selectClass} value={props.layout ?? 'horizontal'} onChange={event => onChange({ ...props, layout: event.target.value as ContactInfoProps['layout'] })}>
          <option value="horizontal">가로</option>
          <option value="vertical">세로</option>
        </select>
      </Field>
      <ListHeader title="연락처" onAdd={() => onChange({ ...props, items: [...props.items, { type: 'email', value: '' }] })} />
      <div className="space-y-2">
        {props.items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <select
              className="w-24 px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none bg-white"
              value={item.type}
              onChange={event => {
                const items = [...props.items]
                items[index] = { ...item, type: event.target.value as ContactInfoProps['items'][number]['type'] }
                onChange({ ...props, items })
              }}
            >
              {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input
              className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              value={item.value}
              placeholder="값"
              onChange={event => {
                const items = [...props.items]
                items[index] = { ...item, value: event.target.value }
                onChange({ ...props, items })
              }}
            />
            <IconButton label="삭제" onClick={() => onChange({ ...props, items: props.items.filter((_, itemIndex) => itemIndex !== index) })} />
          </div>
        ))}
      </div>
    </>
  )
}

function StyleEditor({ style, onChange }: { style: DesignSection['style']; onChange: (style: DesignSection['style']) => void }) {
  const next = style ?? {}
  const background = next.background ?? ''

  function update(patch: DesignSection['style']) {
    onChange({ ...next, ...patch })
  }

  return (
    <div className="border-t border-gray-100 mt-5 pt-5">
      <h4 className="text-xs font-semibold text-gray-800 mb-3">스타일</h4>
      <Field label="정렬">
        <select className={selectClass} value={next.align ?? 'left'} onChange={event => update({ align: event.target.value as NonNullable<DesignSection['style']>['align'] })}>
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
          <option value="right">오른쪽</option>
        </select>
      </Field>
      <Field label="배경색">
        <div className="flex gap-2">
          <input className={inputClass} value={background} placeholder="#F8FAFC" onChange={event => update({ background: event.target.value })} />
          <input
            type="color"
            className="w-10 h-9 p-1 border border-gray-200 rounded-lg bg-white"
            value={background.startsWith('#') && background.length >= 4 ? background : '#ffffff'}
            onChange={event => update({ background: event.target.value })}
          />
        </div>
      </Field>
      <Field label="안쪽 여백">
        <input className={inputClass} value={next.padding ?? ''} placeholder="24px" onChange={event => update({ padding: event.target.value })} />
      </Field>
      <Field label="아래 간격">
        <input type="number" className={inputClass} value={next.marginBottom ?? 16} onChange={event => update({ marginBottom: Number(event.target.value) })} />
      </Field>
    </div>
  )
}

function ListHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-500">{title}</span>
      <button onClick={onAdd} className="text-xs text-blue-600 hover:text-blue-700">+ 추가</button>
    </div>
  )
}

function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button title={label} onClick={onClick} className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50">
      X
    </button>
  )
}

function updateTimelineItem(props: TimelineProps, onChange: (props: TimelineProps) => void, index: number, patch: Partial<TimelineProps['items'][number]>) {
  const items = [...props.items]
  items[index] = { ...items[index], ...patch }
  onChange({ ...props, items })
}

function updateCard(props: CardGridProps, onChange: (props: CardGridProps) => void, index: number, patch: Partial<CardGridProps['cards'][number]>) {
  const cards = [...props.cards]
  cards[index] = { ...cards[index], ...patch }
  onChange({ ...props, cards })
}

export function SectionEditorPanel({ section, onUpdate, onStyleUpdate, onDelete, onClose }: Props) {
  const [localProps, setLocalProps] = useState<SectionProps>(section.props)

  useEffect(() => {
    setLocalProps(section.props)
  }, [section.id, section.props])

  function handleChange(newProps: SectionProps) {
    setLocalProps(newProps)
    onUpdate(newProps)
  }

  function renderEditor() {
    switch (section.type) {
      case 'hero':
        return <HeroEditor props={localProps as HeroProps} onChange={handleChange} />
      case 'text-block':
        return <TextBlockEditor props={localProps as TextBlockProps} onChange={handleChange} />
      case 'skill-list':
        return <SkillListEditor props={localProps as SkillListProps} onChange={handleChange} />
      case 'timeline':
        return <TimelineEditor props={localProps as TimelineProps} onChange={handleChange} />
      case 'card-grid':
        return <CardGridEditor props={localProps as CardGridProps} onChange={handleChange} />
      case 'divider':
        return <DividerEditor props={localProps as DividerProps} onChange={handleChange} />
      case 'contact-info':
        return <ContactInfoEditor props={localProps as ContactInfoProps} onChange={handleChange} />
      default:
        return <p className="text-sm text-gray-400">편집할 수 없는 섹션입니다.</p>
    }
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-xs text-gray-400">섹션 편집</p>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5">{sectionLabels[section.type]}</h3>
        </div>
        <button onClick={onClose} title="닫기" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
        <StyleEditor style={section.style} onChange={onStyleUpdate} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <button onClick={onDelete} className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          섹션 삭제
        </button>
      </div>
    </div>
  )
}
