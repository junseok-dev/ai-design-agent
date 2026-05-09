// 구분선 섹션

import type { DividerProps, DesignTheme } from '../../../types/design'

interface Props {
  props: DividerProps
  theme: DesignTheme
}

export function DividerSection({ props, theme }: Props) {
  const { style = 'line', margin = 8 } = props

  if (style === 'space') {
    return <div style={{ height: `${margin * 2}px` }} />
  }

  if (style === 'dots') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: `${margin}px 0` }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: theme.primaryColor + '50' }} />
        ))}
      </div>
    )
  }

  // 기본: 가로선
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${theme.primaryColor}20`,
        margin: `${margin}px 0`,
      }}
    />
  )
}
