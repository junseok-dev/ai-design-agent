// 연락처 정보 섹션 (이메일, 깃허브, 전화번호 등)

import type { ContactInfoProps, DesignTheme } from '../../../types/design'

interface Props {
  props: ContactInfoProps
  theme: DesignTheme
}

// 아이콘 텍스트 매핑 (실제 아이콘 라이브러리 없이 텍스트로 표현)
const iconMap: Record<string, string> = {
  email: '✉',
  phone: '☎',
  github: '⌥',
  linkedin: 'in',
  website: '🌐',
  location: '◎',
}

const labelMap: Record<string, string> = {
  email: '이메일',
  phone: '전화',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  website: '웹사이트',
  location: '위치',
}

export function ContactInfoSection({ props, theme }: Props) {
  const { items, layout = 'horizontal', heading } = props

  return (
    <div style={{ marginBottom: '8px' }}>
      {heading && (
        <h2 style={{ fontSize: `${theme.fontSize?.base ?? 14}px`, fontWeight: 600, color: theme.primaryColor, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {heading}
        </h2>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: layout === 'horizontal' ? '16px' : '6px',
          flexDirection: layout === 'vertical' ? 'column' : 'row',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: `${(theme.fontSize?.base ?? 14) - 1}px`,
              color: theme.secondaryColor ?? '#6B7280',
            }}
          >
            <span style={{ color: theme.primaryColor, fontWeight: 600, fontSize: '12px', minWidth: '14px' }}>
              {iconMap[item.type] ?? '·'}
            </span>
            <span>{item.label ?? labelMap[item.type]}:</span>
            <span style={{ color: theme.textColor }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
