// 이력서 상단 이름/직함/사진 섹션

import type { HeroProps, DesignTheme } from '../../../types/design'

interface Props {
  props: HeroProps
  theme: DesignTheme
  align?: 'left' | 'center' | 'right'
}

export function HeroSection({ props, theme, align = 'left' }: Props) {
  const { title, subtitle, description, tags, avatarUrl } = props

  const flexJustify =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: flexJustify,
        // 사진이 있으면 텍스트와 나란히, 없으면 텍스트만
        flexDirection: avatarUrl ? 'row' : 'column',
        gap: avatarUrl ? '16px' : '0',
        marginBottom: '12px',
      }}
    >
      {/* 프로필 사진 (있을 때만 표시) */}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="프로필 사진"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            objectFit: 'cover',
            flexShrink: 0,
            border: `2px solid ${theme.primaryColor}20`,
          }}
        />
      )}

      {/* 텍스트 영역 */}
      <div style={{ textAlign: align, flex: 1 }}>
        {/* 이름 */}
        <h1
          style={{
            fontSize: `${(theme.fontSize?.heading ?? 20) + 6}px`,
            fontWeight: 700,
            color: theme.textColor,
            margin: 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        {/* 직함 */}
        {subtitle && (
          <p
            style={{
              fontSize: `${(theme.fontSize?.base ?? 14) + 2}px`,
              fontWeight: 500,
              color: theme.primaryColor,
              margin: '4px 0 0',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* 한 줄 소개 */}
        {description && (
          <p
            style={{
              fontSize: `${theme.fontSize?.base ?? 14}px`,
              color: theme.secondaryColor ?? '#6B7280',
              margin: '6px 0 0',
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        )}

        {/* 태그 */}
        {tags && tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '10px',
              justifyContent: flexJustify,
            }}
          >
            {tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '2px 10px',
                  borderRadius: '999px',
                  backgroundColor: theme.primaryColor + '20',
                  color: theme.primaryColor,
                  fontSize: '12px',
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
  )
}
