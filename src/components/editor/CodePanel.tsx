import { useEffect, useMemo, useState } from 'react'
import type { DesignJSON } from '../../types/design'

interface Props {
  design: DesignJSON
  onApply: (design: DesignJSON) => void
  onClose: () => void
}

type CodeTab = 'json' | 'react'

const panelButtonCls = 'px-3 py-1.5 text-xs font-medium rounded-md transition-colors'
const tabHelp: Record<CodeTab, string> = {
  json: 'Lumio가 실제로 저장하고 렌더링하는 원본 데이터입니다. 수정 후 디자인에 적용하면 현재 문서가 바로 바뀝니다.',
  react: '다른 React 프로젝트에 복사해서 사용할 수 있는 예시 코드입니다. 현재 Lumio 문서를 외부 앱에 임베드할 때 사용합니다.',
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

function createReactSnippet(design: DesignJSON) {
  return `import { DesignRenderer } from './components/renderer/DesignRenderer'

const design = ${JSON.stringify(design, null, 2)}

export function SharedDesign() {
  return <DesignRenderer design={design} />
}
`
}

export function CodePanel({ design, onApply, onClose }: Props) {
  const [tab, setTab] = useState<CodeTab>('json')
  const [jsonText, setJsonText] = useState(() => JSON.stringify(design, null, 2))
  const [status, setStatus] = useState('')

  const reactSnippet = useMemo(() => createReactSnippet(design), [design])
  const currentText = tab === 'json' ? jsonText : reactSnippet

  useEffect(() => {
    setJsonText(JSON.stringify(design, null, 2))
  }, [design])

  function handleApply() {
    try {
      const parsed = JSON.parse(jsonText) as DesignJSON
      if (!parsed.page || !Array.isArray(parsed.page.sections)) {
        setStatus('DesignJSON 구조가 올바르지 않습니다.')
        return
      }
      onApply(parsed)
      setStatus('코드를 디자인에 적용했습니다.')
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'JSON 파싱에 실패했습니다.')
    }
  }

  async function handleCopy() {
    try {
      await copyText(currentText)
      setStatus('코드를 클립보드에 복사했습니다.')
    } catch {
      setStatus('클립보드 복사에 실패했습니다.')
    }
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-xs text-gray-400">Developer</p>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5">Code</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" title="Close">
          X
        </button>
      </div>

      <div className="px-4 pt-3 flex items-center gap-2">
        {(['json', 'react'] as const).map(nextTab => (
          <div key={nextTab} className="relative group flex items-center">
            <button
              onClick={() => setTab(nextTab)}
              className={`${panelButtonCls} ${tab === nextTab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {nextTab === 'json' ? 'DesignJSON' : 'React'}
            </button>
            <span className="ml-1.5 w-4 h-4 rounded-full border border-gray-200 text-[10px] text-gray-400 flex items-center justify-center cursor-help">
              ?
            </span>
            <div className="pointer-events-none absolute left-0 top-8 w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs leading-relaxed text-gray-600 shadow-lg opacity-0 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 z-40">
              {tabHelp[nextTab]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0 p-4">
        {tab === 'json' ? (
          <textarea
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            spellCheck={false}
            className="w-full h-full resize-none rounded-lg border border-gray-200 bg-gray-950 text-gray-100 font-mono text-xs leading-relaxed p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <pre className="w-full h-full overflow-auto rounded-lg border border-gray-200 bg-gray-950 text-gray-100 font-mono text-xs leading-relaxed p-3 whitespace-pre-wrap">
            {reactSnippet}
          </pre>
        )}
      </div>

      {status && (
        <div className="px-4 pb-2 text-xs text-gray-500">
          {status}
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0">
        <button onClick={handleCopy} className="flex-1 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          코드 복사
        </button>
        {tab === 'json' && (
          <button onClick={handleApply} className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            디자인에 적용
          </button>
        )}
      </div>
    </div>
  )
}
