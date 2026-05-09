import { useState, useEffect } from 'react'
import type {
  DesignSection, SectionProps,
  HeroProps, TextBlockProps, SkillListProps,
  TimelineProps, CardGridProps, DividerProps, ContactInfoProps,
} from '../../types/design'

interface Props {
  section: DesignSection
  onUpdate: (props: SectionProps) => void
  onDelete: () => void
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white'
const textareaCls = `${inputCls} resize-none`
const selectCls = inputCls

function HeroEditor({ props, onChange }: { props: HeroProps; onChange: (p: HeroProps) => void }) {
  return (
    <>
      <Field label="이름 / 제목">
        <input className={inputCls} value={props.title} onChange={e => onChange({ ...props, title: e.target.value })} />
      </Field>
      <Field label="부제목">
        <input className={inputCls} value={props.subtitle ?? ''} placeholder="예: Frontend Developer" onChange={e => onChange({ ...props, subtitle: e.target.value })} />
      </Field>
      <Field label="소개">
        <textarea className={textareaCls} rows={3} value={props.description ?? ''} onChange={e => onChange({ ...props, description: e.target.value })} />
      </Field>
      <Field label="태그 (쉼표로 구분)">
        <input className={inputCls} value={(props.tags ?? []).join(', ')} placeholder="React, TypeScript, ..." onChange={e => onChange({ ...props, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} />
      </Field>
    </>
  )
}

function TextBlockEditor({ props, onChange }: { props: TextBlockProps; onChange: (p: TextBlockProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputCls} value={props.heading ?? ''} onChange={e => onChange({ ...props, heading: e.target.value })} />
      </Field>
      <Field label="본문">
        <textarea className={textareaCls} rows={5} value={props.body} onChange={e => onChange({ ...props, body: e.target.value })} />
      </Field>
    </>
  )
}

function SkillListEditor({ props, onChange }: { props: SkillListProps; onChange: (p: SkillListProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputCls} value={props.heading ?? ''} onChange={e => onChange({ ...props, heading: e.target.value })} />
      </Field>
      <Field label="표시 방식">
        <select className={selectCls} value={props.displayStyle ?? 'tags'} onChange={e => onChange({ ...props, displayStyle: e.target.value as 'tags' | 'bars' })}>
          <option value="tags">태그</option>
          <option value="bars">막대 그래프</option>
        </select>
      </Field>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">스킬 목록</span>
          <button onClick={() => onChange({ ...props, skills: [...props.skills, { name: '', level: 80 }] })} className="text-xs text-blue-600 hover:text-blue-700">+ 추가</button>
        </div>
        {props.skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-2 bg-gray-50 rounded-lg p-2">
            <input
              value={skill.name} placeholder="스킬명"
              onChange={e => { const skills = [...props.skills]; skills[i] = { ...skills[i], name: e.target.value }; onChange({ ...props, skills }) }}
              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
            />
            {props.displayStyle === 'bars' && (
              <input
                type="number" min={0} max={100} value={skill.level ?? 80}
                onChange={e => { const skills = [...props.skills]; skills[i] = { ...skills[i], level: Number(e.target.value) }; onChange({ ...props, skills }) }}
                className="w-14 px-2 py-1 text-xs border border-gray-200 rounded text-center focus:outline-none focus:border-blue-400"
              />
            )}
            <button onClick={() => onChange({ ...props, skills: props.skills.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-400 text-sm leading-none">✕</button>
          </div>
        ))}
      </div>
    </>
  )
}

function TimelineEditor({ props, onChange }: { props: TimelineProps; onChange: (p: TimelineProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputCls} value={props.heading ?? ''} onChange={e => onChange({ ...props, heading: e.target.value })} />
      </Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">항목</span>
          <button onClick={() => onChange({ ...props, items: [...props.items, { period: '', title: '', organization: '' }] })} className="text-xs text-blue-600">+ 추가</button>
        </div>
        {props.items.map((item, i) => (
          <div key={i} className="mb-3 bg-gray-50 rounded-lg p-2.5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">항목 {i + 1}</span>
              <button onClick={() => onChange({ ...props, items: props.items.filter((_, j) => j !== i) })} className="text-xs text-red-400 hover:text-red-600">삭제</button>
            </div>
            <div className="space-y-1.5">
              {(
                [
                  { key: 'period',       placeholder: '기간 (예: 2022 ~ 현재)' },
                  { key: 'title',        placeholder: '직함 / 학위' },
                  { key: 'organization', placeholder: '회사 / 학교' },
                ] as { key: keyof typeof item; placeholder: string }[]
              ).map(({ key, placeholder }) => (
                <input
                  key={key}
                  value={(item[key] as string) ?? ''}
                  placeholder={placeholder}
                  onChange={e => { const items = [...props.items]; items[i] = { ...items[i], [key]: e.target.value }; onChange({ ...props, items }) }}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                />
              ))}
              <textarea
                value={item.description ?? ''} placeholder="설명" rows={2}
                onChange={e => { const items = [...props.items]; items[i] = { ...items[i], description: e.target.value }; onChange({ ...props, items }) }}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded resize-none focus:outline-none focus:border-blue-400"
              />
              <input
                value={(item.tags ?? []).join(', ')} placeholder="태그 (쉼표 구분)"
                onChange={e => { const items = [...props.items]; items[i] = { ...items[i], tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }; onChange({ ...props, items }) }}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function CardGridEditor({ props, onChange }: { props: CardGridProps; onChange: (p: CardGridProps) => void }) {
  return (
    <>
      <Field label="제목">
        <input className={inputCls} value={props.heading ?? ''} onChange={e => onChange({ ...props, heading: e.target.value })} />
      </Field>
      <Field label="열 수">
        <select className={selectCls} value={props.columns ?? 2} onChange={e => onChange({ ...props, columns: Number(e.target.value) })}>
          <option value={1}>1열</option>
          <option value={2}>2열</option>
          <option value={3}>3열</option>
        </select>
      </Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">카드 목록</span>
          <button onClick={() => onChange({ ...props, cards: [...props.cards, { title: '' }] })} className="text-xs text-blue-600">+ 추가</button>
        </div>
        {props.cards.map((card, i) => (
          <div key={i} className="mb-3 bg-gray-50 rounded-lg p-2.5">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">카드 {i + 1}</span>
              <button onClick={() => onChange({ ...props, cards: props.cards.filter((_, j) => j !== i) })} className="text-xs text-red-400">삭제</button>
            </div>
            <div className="space-y-1.5">
              {(
                [
                  { key: 'title',    placeholder: '제목' },
                  { key: 'subtitle', placeholder: '부제목' },
                ] as { key: keyof typeof card; placeholder: string }[]
              ).map(({ key, placeholder }) => (
                <input key={key} value={(card[key] as string) ?? ''} placeholder={placeholder}
                  onChange={e => { const cards = [...props.cards]; cards[i] = { ...cards[i], [key]: e.target.value }; onChange({ ...props, cards }) }}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
                />
              ))}
              <textarea value={card.description ?? ''} placeholder="설명" rows={2}
                onChange={e => { const cards = [...props.cards]; cards[i] = { ...cards[i], description: e.target.value }; onChange({ ...props, cards }) }}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded resize-none focus:outline-none focus:border-blue-400"
              />
              <input value={(card.tags ?? []).join(', ')} placeholder="태그 (쉼표 구분)"
                onChange={e => { const cards = [...props.cards]; cards[i] = { ...cards[i], tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }; onChange({ ...props, cards }) }}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function DividerEditor({ props, onChange }: { props: DividerProps; onChange: (p: DividerProps) => void }) {
  return (
    <>
      <Field label="스타일">
        <select className={selectCls} value={props.style ?? 'line'} onChange={e => onChange({ ...props, style: e.target.value as 'line' | 'space' | 'dots' })}>
          <option value="line">선</option>
          <option value="space">여백</option>
          <option value="dots">점</option>
        </select>
      </Field>
      <Field label="여백 (px)">
        <input type="number" className={inputCls} value={props.margin ?? 8} onChange={e => onChange({ ...props, margin: Number(e.target.value) })} />
      </Field>
    </>
  )
}

function ContactInfoEditor({ props, onChange }: { props: ContactInfoProps; onChange: (p: ContactInfoProps) => void }) {
  const TYPES = ['email', 'phone', 'github', 'linkedin', 'website', 'location'] as const
  return (
    <>
      <Field label="제목">
        <input className={inputCls} value={props.heading ?? ''} onChange={e => onChange({ ...props, heading: e.target.value })} />
      </Field>
      <Field label="레이아웃">
        <select className={selectCls} value={props.layout ?? 'horizontal'} onChange={e => onChange({ ...props, layout: e.target.value as 'horizontal' | 'vertical' })}>
          <option value="horizontal">가로</option>
          <option value="vertical">세로</option>
        </select>
      </Field>
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">항목</span>
          <button onClick={() => onChange({ ...props, items: [...props.items, { type: 'email', value: '' }] })} className="text-xs text-blue-600">+ 추가</button>
        </div>
        {props.items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-2">
            <select value={item.type}
              onChange={e => { const items = [...props.items]; items[i] = { ...items[i], type: e.target.value as typeof item.type }; onChange({ ...props, items }) }}
              className="px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none bg-white"
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={item.value} placeholder="값"
              onChange={e => { const items = [...props.items]; items[i] = { ...items[i], value: e.target.value }; onChange({ ...props, items }) }}
              className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400"
            />
            <button onClick={() => onChange({ ...props, items: props.items.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-400 text-sm leading-none">✕</button>
          </div>
        ))}
      </div>
    </>
  )
}

const SECTION_LABELS: Record<string, string> = {
  'hero': '헤더',
  'text-block': '텍스트 블록',
  'skill-list': '스킬 목록',
  'timeline': '타임라인',
  'card-grid': '카드 그리드',
  'divider': '구분선',
  'contact-info': '연락처',
}

export function SectionEditorPanel({ section, onUpdate, onDelete, onClose }: Props) {
  const [localProps, setLocalProps] = useState<SectionProps>(section.props)

  useEffect(() => {
    setLocalProps(section.props)
  }, [section.id])

  function handleChange(newProps: SectionProps) {
    setLocalProps(newProps)
    onUpdate(newProps)
  }

  function renderEditor() {
    switch (section.type) {
      case 'hero':         return <HeroEditor props={localProps as HeroProps} onChange={handleChange} />
      case 'text-block':   return <TextBlockEditor props={localProps as TextBlockProps} onChange={handleChange} />
      case 'skill-list':   return <SkillListEditor props={localProps as SkillListProps} onChange={handleChange} />
      case 'timeline':     return <TimelineEditor props={localProps as TimelineProps} onChange={handleChange} />
      case 'card-grid':    return <CardGridEditor props={localProps as CardGridProps} onChange={handleChange} />
      case 'divider':      return <DividerEditor props={localProps as DividerProps} onChange={handleChange} />
      case 'contact-info': return <ContactInfoEditor props={localProps as ContactInfoProps} onChange={handleChange} />
      default:             return <p className="text-sm text-gray-400">편집 불가 섹션입니다.</p>
    }
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-xs text-gray-400">섹션 편집</p>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5">{SECTION_LABELS[section.type] ?? section.type}</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderEditor()}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <button onClick={onDelete} className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          섹션 삭제
        </button>
      </div>
    </div>
  )
}
