import { useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useDesignStore } from '../../store/useDesignStore'
import { useAuthStore } from '../../store/useAuthStore'
import { publishDocument } from '../../services/documentService'
import { DesignRenderer } from '../renderer/DesignRenderer'
import { SectionEditorPanel } from '../editor/SectionEditorPanel'
import { ThemeEditorPanel } from '../editor/ThemeEditorPanel'
import { TemplateGallery } from '../templates/TemplateGallery'
import type { DesignJSON, DesignSection, HeroProps, SavedDocument, SectionProps } from '../../types/design'
import { ADDABLE_SECTION_TYPES, SECTION_TYPE_LABELS, createDefaultSection, type AddableSectionType } from './sectionDefaults'

type PreviewMode = 'a4' | 'web'

async function writeClipboardWithTimeout(text: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Clipboard write timed out')), 3000)
  })

  try {
    await Promise.race([navigator.clipboard.writeText(text), timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export function PreviewPanel() {
  const { design, documents, activeDocumentId, undo, redo, canUndo, canRedo, setDesign, saveAsNewDocument } = useDesignStore()
  const { user } = useAuthStore()
  const printRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showThemeEditor, setShowThemeEditor] = useState(false)
  const [showAddSectionMenu, setShowAddSectionMenu] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('a4')
  const [shareStatus, setShareStatus] = useState<'idle' | 'saving' | 'copied' | 'error'>('idle')
  const [shareMessage, setShareMessage] = useState('')

  const selectedSection = design?.page.sections.find(s => s.id === selectedSectionId) ?? null
  const activeDocument = documents.find(doc => doc.id === activeDocumentId) ?? null
  const hasPhoto = design?.page.sections.some(s => s.type === 'hero' && (s.props as HeroProps).avatarUrl)
  const hasHero = design?.page.sections.some(s => s.type === 'hero')

  const previewDesign = useMemo(() => {
    if (!design || previewMode === 'a4') return design

    return {
      ...design,
      page: {
        ...design.page,
        layout: {
          ...design.page.layout,
          width: '100%',
          height: undefined,
        },
      },
    }
  }, [design, previewMode])

  function closeSidePanels() {
    setShowThemeEditor(false)
    setSelectedSectionId(null)
    setShowAddSectionMenu(false)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !design) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      const sections = design.page.sections.map(section =>
        section.type === 'hero'
          ? { ...section, props: { ...(section.props as HeroProps), avatarUrl: base64 } }
          : section
      )
      setDesign({ ...design, page: { ...design.page, sections } })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handlePhotoRemove() {
    if (!design) return

    const sections = design.page.sections.map(section => {
      if (section.type !== 'hero') return section
      const { avatarUrl: _avatarUrl, ...props } = section.props as HeroProps
      return { ...section, props }
    })
    setDesign({ ...design, page: { ...design.page, sections } })
  }

  function handleReorder(sections: DesignSection[]) {
    if (!design) return
    setDesign({ ...design, page: { ...design.page, sections } })
  }

  function handleSectionUpdate(props: SectionProps) {
    if (!design || !selectedSectionId) return

    const sections = design.page.sections.map(section =>
      section.id === selectedSectionId ? { ...section, props } : section
    )
    setDesign({ ...design, page: { ...design.page, sections } })
  }

  function handleThemeUpdate(theme: DesignJSON['page']['theme']) {
    if (!design) return
    setDesign({ ...design, page: { ...design.page, theme } })
  }

  function handleSectionDelete() {
    if (!design || !selectedSectionId) return

    const sections = design.page.sections.filter(section => section.id !== selectedSectionId)
    setDesign({ ...design, page: { ...design.page, sections } })
    setSelectedSectionId(null)
  }

  function handleAddSection(type: AddableSectionType) {
    if (!design) return

    const section = createDefaultSection(type)
    setDesign({ ...design, page: { ...design.page, sections: [...design.page.sections, section] } })
    setSelectedSectionId(section.id)
    setShowThemeEditor(false)
    setShowAddSectionMenu(false)
  }

  function handleTemplateSelect(template: DesignJSON) {
    const freshTemplate: DesignJSON = {
      ...template,
      page: {
        ...template.page,
        sections: template.page.sections.map(section => ({ ...section, id: crypto.randomUUID() })),
      },
    }
    saveAsNewDocument(freshTemplate)
    setShowTemplates(false)
  }

  async function handleShare() {
    if (!design) return

    setShareStatus('saving')
    setShareMessage('')
    const doc: SavedDocument = {
      id: activeDocumentId ?? crypto.randomUUID(),
      name: activeDocument?.name ?? 'Shared design',
      design,
      createdAt: activeDocument?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    }

    const result = await publishDocument(doc, user?.id ?? '')
    if (!result.ok) {
      setShareStatus('error')
      setShareMessage(`공유 저장 실패: ${result.error ?? 'Supabase 마이그레이션과 RLS 정책을 확인해 주세요.'}`)
      setShareMessage('공유 저장에 실패했습니다. Supabase 마이그레이션과 RLS 정책을 확인해 주세요.')
      setShareMessage(`공유 저장 실패: ${result.error ?? 'Supabase 마이그레이션과 RLS 정책을 확인해 주세요.'}`)
      return
    }

    const url = `${window.location.origin}/share/${doc.id}`
    try {
      await writeClipboardWithTimeout(url)
      setShareStatus('copied')
      setShareMessage('공유 링크를 클립보드에 복사했습니다.')
    } catch {
      window.prompt('Share URL', url)
      setShareStatus('copied')
      setShareMessage('공유 링크를 만들었습니다.')
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Lumio-Design',
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        #design-canvas { page-break-inside: avoid; }
      }
    `,
  })

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Preview</span>
          {design && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              {design.page.type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setShowTemplates(true)
              closeSidePanels()
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Templates
          </button>

          <button
            onClick={() => {
              setShowThemeEditor(value => !value)
              setSelectedSectionId(null)
              setShowAddSectionMenu(false)
            }}
            disabled={!design}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: design?.page.theme.primaryColor ?? '#2563EB' }} />
            Theme
          </button>

          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            {(['a4', 'web'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                disabled={!design}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  previewMode === mode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {mode === 'a4' ? 'A4' : 'Web'}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          <button onClick={undo} disabled={!canUndo()} title="이전 (Ctrl+Z)" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            이전
          </button>
          <button onClick={redo} disabled={!canRedo()} title="다음 (Ctrl+Y)" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            다음
          </button>

          {hasHero && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {hasPhoto ? 'Change photo' : 'Add photo'}
              </button>
              {hasPhoto && (
                <button onClick={handlePhotoRemove} title="Remove photo" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  X
                </button>
              )}
            </>
          )}

          <button onClick={handleShare} disabled={!design || shareStatus === 'saving'} className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {shareStatus === 'saving' ? 'Sharing...' : shareStatus === 'copied' ? 'Copied' : shareStatus === 'error' ? 'Share failed' : 'Share'}
          </button>

          <button onClick={() => handlePrint()} disabled={!design} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            PDF
          </button>
        </div>
      </div>
      {shareMessage && (
        <div className={`px-4 py-2 text-xs border-b flex-shrink-0 ${
          shareStatus === 'error'
            ? 'bg-red-50 text-red-700 border-red-100'
            : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {shareMessage}
        </div>
      )}

      <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
        {previewDesign ? (
          <div className={previewMode === 'web' ? 'relative w-full max-w-5xl' : 'relative'}>
            <div style={previewMode === 'a4' ? { transform: 'scale(0.7)', transformOrigin: 'top center', marginBottom: '-240px' } : undefined}>
              <div style={previewMode === 'a4' ? { boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)' } : undefined}>
                <DesignRenderer
                  ref={printRef}
                  design={previewDesign}
                  editable
                  onReorder={handleReorder}
                  onSectionClick={(id) => {
                    setSelectedSectionId(id)
                    setShowThemeEditor(false)
                    setShowAddSectionMenu(false)
                  }}
                />
              </div>
            </div>

            <div className="print:hidden mt-4 flex justify-center relative">
              <button
                onClick={() => {
                  setShowAddSectionMenu(value => !value)
                  setShowThemeEditor(false)
                  setSelectedSectionId(null)
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg leading-none text-blue-600">+</span>
                Add section
              </button>
              {showAddSectionMenu && (
                <div className="absolute top-11 w-44 rounded-lg border border-gray-200 bg-white shadow-lg p-1 z-20">
                  {ADDABLE_SECTION_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => handleAddSection(type)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {SECTION_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 text-blue-600 font-bold">
              L
            </div>
            <p className="text-gray-500 font-medium mb-1">No design yet</p>
            <p className="text-gray-400 text-sm mb-4">Start with AI chat or choose a template.</p>
            <button onClick={() => setShowTemplates(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Choose template
            </button>
          </div>
        )}
      </div>

      {selectedSection && (
        <SectionEditorPanel
          section={selectedSection}
          onUpdate={handleSectionUpdate}
          onDelete={handleSectionDelete}
          onClose={() => setSelectedSectionId(null)}
        />
      )}

      {design && showThemeEditor && (
        <ThemeEditorPanel
          theme={design.page.theme}
          onUpdate={handleThemeUpdate}
          onClose={() => setShowThemeEditor(false)}
        />
      )}

      {showTemplates && (
        <TemplateGallery
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}
