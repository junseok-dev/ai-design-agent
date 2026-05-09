import { templates } from '../../mock/templates'
import type { DesignJSON } from '../../types/design'

interface Props {
  onSelect: (design: DesignJSON) => void
  onClose: () => void
}

const TEMPLATE_META = [
  { key: 'resume',          name: '기본 이력서',   type: '이력서',     desc: '블루톤 스탠다드',    color: '#2563EB' },
  { key: 'resume-minimal',  name: '미니멀 이력서', type: '이력서',     desc: '심플 그린 스타일',   color: '#059669' },
  { key: 'resume-dark',     name: '다크 이력서',   type: '이력서',     desc: '세련된 다크 테마',   color: '#818CF8' },
  { key: 'portfolio',       name: '포트폴리오',    type: '포트폴리오', desc: '작업물 중심 레이아웃', color: '#7C3AED' },
]

export function TemplateGallery({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">템플릿 선택</h2>
            <p className="text-sm text-gray-400 mt-0.5">원하는 템플릿으로 시작하세요</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {TEMPLATE_META.map(meta => {
              const design = templates[meta.key]
              if (!design) return null
              return (
                <button
                  key={meta.key}
                  onClick={() => onSelect(design)}
                  className="text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-full h-28 rounded-lg mb-3 p-3 flex flex-col gap-2 overflow-hidden"
                    style={{ backgroundColor: meta.color + '10', border: `1px solid ${meta.color}25` }}
                  >
                    <div className="h-3 rounded-full" style={{ backgroundColor: meta.color, width: '55%' }} />
                    <div className="h-2 rounded-full bg-gray-200" style={{ width: '80%' }} />
                    <div className="h-2 rounded-full bg-gray-200" style={{ width: '65%' }} />
                    <div className="flex gap-1.5 mt-auto">
                      {[48, 62, 40].map((w, i) => (
                        <div key={i} className="h-5 rounded" style={{ backgroundColor: meta.color + '28', width: w }} />
                      ))}
                    </div>
                    <div className="h-2 rounded-full bg-gray-200" style={{ width: '70%' }} />
                    <div className="h-2 rounded-full bg-gray-200" style={{ width: '50%' }} />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{meta.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: meta.color + '15', color: meta.color }}
                    >
                      {meta.type}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
