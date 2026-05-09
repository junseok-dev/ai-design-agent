import type { DesignTheme } from '../../types/design'

interface Props {
  theme: DesignTheme
  onUpdate: (theme: DesignTheme) => void
  onClose: () => void
}

const inputCls = 'w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white'
const fontOptions = ['Inter', 'Pretendard', 'Noto Sans KR', 'Arial', 'Georgia', 'Times New Roman']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
        />
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputCls}
          placeholder="#2563EB"
        />
      </div>
    </Field>
  )
}

export function ThemeEditorPanel({ theme, onUpdate, onClose }: Props) {
  const fontSize = theme.fontSize ?? { base: 14, heading: 20 }

  function updateTheme(next: Partial<DesignTheme>) {
    onUpdate({ ...theme, ...next })
  }

  function updateFontSize(next: Partial<NonNullable<DesignTheme['fontSize']>>) {
    updateTheme({ fontSize: { ...fontSize, ...next } })
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div>
          <p className="text-xs text-gray-400">Design</p>
          <h3 className="text-sm font-semibold text-gray-800 mt-0.5">Theme</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ColorField label="Primary color" value={theme.primaryColor} onChange={primaryColor => updateTheme({ primaryColor })} />
        <ColorField label="Background color" value={theme.backgroundColor} onChange={backgroundColor => updateTheme({ backgroundColor })} />
        <ColorField label="Text color" value={theme.textColor} onChange={textColor => updateTheme({ textColor })} />

        <Field label="Font family">
          <select
            className={inputCls}
            value={theme.fontFamily}
            onChange={e => updateTheme({ fontFamily: e.target.value })}
          >
            {fontOptions.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </Field>

        <Field label="Base font size">
          <input
            type="number"
            min={10}
            max={24}
            value={fontSize.base}
            onChange={e => updateFontSize({ base: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>

        <Field label="Heading font size">
          <input
            type="number"
            min={14}
            max={40}
            value={fontSize.heading}
            onChange={e => updateFontSize({ heading: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  )
}
