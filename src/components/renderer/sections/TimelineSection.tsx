// 타임라인 섹션 (경력, 학력 등)

import type { TimelineProps, DesignTheme } from '../../../types/design'

interface Props {
  props: TimelineProps
  theme: DesignTheme
}

export function TimelineSection({ props, theme }: Props) {
  const { heading, items } = props

  return (
    <div style={{ marginBottom: '14px' }}>
      {heading && (
        <h2
          style={{
            fontSize: `${theme.fontSize?.base ?? 14}px`,
            fontWeight: 700,
            color: theme.primaryColor,
            marginBottom: '10px',
            paddingBottom: '4px',
            borderBottom: `1.5px solid ${theme.primaryColor}30`,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {heading}
        </h2>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px' }}>
            {/* 왼쪽 타임라인 점과 선 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '10px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.primaryColor,
                  marginTop: '5px',
                  flexShrink: 0,
                }}
              />
              {i < items.length - 1 && (
                <div style={{ width: '1px', flex: 1, backgroundColor: theme.primaryColor + '30', marginTop: '4px' }} />
              )}
            </div>

            {/* 내용 */}
            <div style={{ flex: 1, paddingBottom: '4px' }}>
              {/* 기간 */}
              <p
                style={{
                  fontSize: '11px',
                  color: theme.secondaryColor ?? '#6B7280',
                  margin: '0 0 2px',
                  fontWeight: 500,
                }}
              >
                {item.period}
              </p>

              {/* 직책/학위 + 회사/학교 */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: `${theme.fontSize?.base ?? 14}px`, fontWeight: 600, color: theme.textColor }}>
                  {item.title}
                </span>
                <span style={{ fontSize: `${(theme.fontSize?.base ?? 14) - 1}px`, color: theme.primaryColor, fontWeight: 500 }}>
                  @ {item.organization}
                </span>
              </div>

              {/* 설명 */}
              {item.description && (
                <p
                  style={{
                    fontSize: `${(theme.fontSize?.base ?? 14) - 1}px`,
                    color: theme.secondaryColor ?? '#6B7280',
                    margin: '4px 0 0',
                    lineHeight: 1.6,
                  }}
                >
                  {item.description}
                </p>
              )}

              {/* 태그 */}
              {item.tags && item.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '1px 8px',
                        borderRadius: '3px',
                        backgroundColor: theme.primaryColor + '15',
                        color: theme.primaryColor,
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
