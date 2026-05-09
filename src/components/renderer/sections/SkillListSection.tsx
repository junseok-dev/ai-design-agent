// 기술 스택 섹션 (태그형 / 바형)

import type { SkillListProps, DesignTheme } from '../../../types/design'

interface Props {
  props: SkillListProps
  theme: DesignTheme
}

export function SkillListSection({ props, theme }: Props) {
  const { heading, skills, displayStyle = 'tags' } = props

  return (
    <div style={{ marginBottom: '14px' }}>
      {heading && (
        <h2
          style={{
            fontSize: `${theme.fontSize?.base ?? 14}px`,
            fontWeight: 700,
            color: theme.primaryColor,
            marginBottom: '8px',
            paddingBottom: '4px',
            borderBottom: `1.5px solid ${theme.primaryColor}30`,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {heading}
        </h2>
      )}

      {displayStyle === 'tags' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {skills.map((skill, i) => (
            <span
              key={i}
              style={{
                padding: '3px 12px',
                borderRadius: '4px',
                border: `1px solid ${theme.primaryColor}40`,
                backgroundColor: theme.primaryColor + '10',
                color: theme.textColor,
                fontSize: `${(theme.fontSize?.base ?? 14) - 1}px`,
                fontWeight: 500,
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      )}

      {displayStyle === 'bars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {skills.map((skill, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: `${(theme.fontSize?.base ?? 14) - 1}px`, fontWeight: 500, color: theme.textColor }}>
                  {skill.name}
                </span>
                {skill.level !== undefined && (
                  <span style={{ fontSize: '11px', color: theme.secondaryColor }}>{skill.level}%</span>
                )}
              </div>
              {skill.level !== undefined && (
                <div style={{ height: '5px', backgroundColor: theme.primaryColor + '20', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${skill.level}%`,
                      height: '100%',
                      backgroundColor: theme.primaryColor,
                      borderRadius: '999px',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
