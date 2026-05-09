// 카드 그리드 섹션 (프로젝트 목록 등)

import type { CardGridProps, DesignTheme } from '../../../types/design'

interface Props {
  props: CardGridProps
  theme: DesignTheme
}

export function CardGridSection({ props, theme }: Props) {
  const { heading, cards, columns = 2 } = props

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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '10px',
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              border: `1px solid ${theme.primaryColor}20`,
              borderRadius: '6px',
              backgroundColor: theme.primaryColor + '05',
            }}
          >
            {/* 카드 제목 */}
            <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: `${theme.fontSize?.base ?? 14}px`, color: theme.textColor }}>
              {card.title}
            </p>

            {/* 기간/부제목 */}
            {card.subtitle && (
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: theme.secondaryColor ?? '#6B7280' }}>
                {card.subtitle}
              </p>
            )}

            {/* 설명 */}
            {card.description && (
              <p
                style={{
                  margin: '4px 0',
                  fontSize: `${(theme.fontSize?.base ?? 14) - 1}px`,
                  color: theme.secondaryColor ?? '#6B7280',
                  lineHeight: 1.6,
                }}
              >
                {card.description}
              </p>
            )}

            {/* 태그 */}
            {card.tags && card.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: '1px 7px',
                      borderRadius: '3px',
                      backgroundColor: theme.primaryColor + '20',
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
        ))}
      </div>
    </div>
  )
}
