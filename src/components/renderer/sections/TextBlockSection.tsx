// 텍스트 블록 섹션 (자기소개, 요약 등)

import type { TextBlockProps, DesignTheme } from '../../../types/design'

interface Props {
  props: TextBlockProps
  theme: DesignTheme
}

export function TextBlockSection({ props, theme }: Props) {
  const { heading, body } = props

  return (
    <div style={{ marginBottom: '14px' }}>
      {heading && (
        <h2
          style={{
            fontSize: `${theme.fontSize?.base ?? 14}px`,
            fontWeight: 700,
            color: theme.primaryColor,
            marginBottom: '6px',
            paddingBottom: '4px',
            borderBottom: `1.5px solid ${theme.primaryColor}30`,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {heading}
        </h2>
      )}
      <p
        style={{
          fontSize: `${theme.fontSize?.base ?? 14}px`,
          color: theme.textColor,
          lineHeight: 1.7,
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {body}
      </p>
    </div>
  )
}
