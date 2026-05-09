import { forwardRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DesignJSON, DesignSection } from '../../types/design'
import { HeroSection } from './sections/HeroSection'
import { TextBlockSection } from './sections/TextBlockSection'
import { SkillListSection } from './sections/SkillListSection'
import { TimelineSection } from './sections/TimelineSection'
import { CardGridSection } from './sections/CardGridSection'
import { DividerSection } from './sections/DividerSection'
import { ContactInfoSection } from './sections/ContactInfoSection'

interface Props {
  design: DesignJSON
  editable?: boolean
  onReorder?: (sections: DesignSection[]) => void
  onSectionClick?: (sectionId: string) => void
}

function SortableItem({
  id, children, onEdit,
}: {
  id: string
  children: React.ReactNode
  onEdit?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
      className="relative group"
    >
      {/* 편집 툴바 — 인쇄 시 숨김 */}
      <div className="print:hidden absolute top-1 right-1 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm"
        >
          편집
        </button>
        <button
          {...attributes}
          {...listeners}
          className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-400 hover:bg-gray-50 shadow-sm cursor-grab active:cursor-grabbing select-none"
        >
          ⣿
        </button>
      </div>
      {/* 호버 테두리 */}
      <div className="print:hidden absolute inset-0 border-2 border-transparent group-hover:border-blue-200 rounded pointer-events-none transition-colors z-10" />
      {children}
    </div>
  )
}

export const DesignRenderer = forwardRef<HTMLDivElement, Props>(
  ({ design, editable, onReorder, onSectionClick }, ref) => {
    const { page } = design
    const { theme, layout, sections } = page

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    )

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIdx = sections.findIndex(s => s.id === String(active.id))
        const newIdx = sections.findIndex(s => s.id === String(over.id))
        onReorder?.(arrayMove(sections, oldIdx, newIdx))
      }
    }

    function renderSection(section: DesignSection) {
      const { type, props, style } = section
      switch (type) {
        case 'hero':
          return <HeroSection props={props as Parameters<typeof HeroSection>[0]['props']} theme={theme} align={style?.align} />
        case 'text-block':
          return <TextBlockSection props={props as Parameters<typeof TextBlockSection>[0]['props']} theme={theme} />
        case 'skill-list':
          return <SkillListSection props={props as Parameters<typeof SkillListSection>[0]['props']} theme={theme} />
        case 'timeline':
          return <TimelineSection props={props as Parameters<typeof TimelineSection>[0]['props']} theme={theme} />
        case 'card-grid':
          return <CardGridSection props={props as Parameters<typeof CardGridSection>[0]['props']} theme={theme} />
        case 'divider':
          return <DividerSection props={props as Parameters<typeof DividerSection>[0]['props']} theme={theme} />
        case 'contact-info':
          return <ContactInfoSection props={props as Parameters<typeof ContactInfoSection>[0]['props']} theme={theme} />
        default:
          return (
            <div style={{ padding: '8px', backgroundColor: '#FEF3C7', borderRadius: '4px', fontSize: '12px' }}>
              알 수 없는 섹션: {type}
            </div>
          )
      }
    }

    function sectionWrapper(section: DesignSection) {
      return (
        <div
          style={{
            pageBreakInside: 'avoid',
            ...(section.style?.background   ? { backgroundColor: section.style.background } : {}),
            ...(section.style?.padding      ? { padding: section.style.padding }             : {}),
            ...(section.style?.marginBottom ? { marginBottom: section.style.marginBottom }   : {}),
          }}
        >
          {renderSection(section)}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        id="design-canvas"
        style={{
          width: layout.width,
          minHeight: layout.height ?? 'auto',
          backgroundColor: theme.backgroundColor,
          padding: layout.padding,
          fontFamily: theme.fontFamily + ', Inter, sans-serif',
          color: theme.textColor,
          boxSizing: 'border-box',
          pageBreakInside: 'avoid',
        }}
      >
        {editable ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map(section => (
                <SortableItem
                  key={section.id}
                  id={section.id}
                  onEdit={() => onSectionClick?.(section.id)}
                >
                  {sectionWrapper(section)}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          sections.map(section => (
            <div key={section.id} style={{ pageBreakInside: 'avoid' }}>
              {sectionWrapper(section)}
            </div>
          ))
        )}
      </div>
    )
  }
)

DesignRenderer.displayName = 'DesignRenderer'
