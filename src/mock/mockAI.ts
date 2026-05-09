// ============================================================
// Mock AI 시스템
// 실제 AI API 연동 전에 자연어 명령을 파싱하여 designJSON을 수정한다
// 나중에 이 파일만 교체하면 실제 Claude/OpenAI API로 전환 가능하다
// ============================================================

import type { DesignJSON, DesignSection } from '../types/design'
import { resumeTemplate, portfolioTemplate } from './templates'

// AI 응답 타입
export interface AIResponse {
  message: string            // 사용자에게 보여줄 응답 메시지
  updatedDesign?: DesignJSON // 변경된 designJSON (없으면 디자인 변경 없음)
  action?: AIAction          // 수행한 액션 타입
}

export type AIAction =
  | 'create'           // 새 디자인 생성
  | 'update-theme'     // 색상/폰트 변경
  | 'update-layout'    // 여백/레이아웃 변경
  | 'move-section'     // 섹션 순서 이동
  | 'add-section'      // 섹션 추가
  | 'remove-section'   // 섹션 제거
  | 'update-content'   // 내용 수정
  | 'none'             // 변경 없음

// ---- 키워드 기반 인텐트 감지 ----

function detectIntent(input: string): string {
  const lower = input.toLowerCase()

  if (/(이력서|resume|cv)/.test(lower) && /(만들|생성|작성|줘|해줘)/.test(lower)) return 'create-resume'
  if (/(포트폴리오|portfolio)/.test(lower) && /(만들|생성|작성|줘|해줘)/.test(lower)) return 'create-portfolio'
  if (/(파랑|블루|blue|#2563|남색)/.test(lower)) return 'theme-blue'
  if (/(초록|그린|green|emerald)/.test(lower)) return 'theme-green'
  if (/(보라|퍼플|purple|violet)/.test(lower)) return 'theme-purple'
  if (/(빨강|레드|red|rose)/.test(lower)) return 'theme-red'
  if (/(어둡|다크|dark|검정)/.test(lower)) return 'theme-dark'
  if (/(밝|라이트|light|흰)/.test(lower)) return 'theme-light'
  if (/(여백|패딩|padding).*줄/.test(lower) || /줄.*여백/.test(lower)) return 'reduce-padding'
  if (/(여백|패딩|padding).*늘|넓/.test(lower) || /늘.*여백/.test(lower)) return 'increase-padding'
  if (/(프로젝트|project).*위|올려/.test(lower) || /위.*프로젝트/.test(lower)) return 'move-projects-up'
  if (/(경력|experience).*위|올려/.test(lower)) return 'move-experience-up'
  if (/(폰트|글자|font).*키워|크게/.test(lower)) return 'increase-font'
  if (/(폰트|글자|font).*줄|작게/.test(lower)) return 'decrease-font'
  if (/(안녕|hello|hi|반가)/.test(lower)) return 'greet'
  if (/(도움|뭐|기능|할 수|가능)/.test(lower)) return 'help'

  return 'unknown'
}

// ---- 섹션 이동 헬퍼 ----

function moveSectionUp(sections: DesignSection[], sectionType: string): DesignSection[] {
  const idx = sections.findIndex(s => s.type === sectionType || s.id.includes(sectionType))
  if (idx <= 0) return sections
  const newSections = [...sections]
  ;[newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]]
  return newSections
}

// ---- 테마 프리셋 ----

const themePresets: Record<string, Partial<DesignJSON['page']['theme']>> = {
  blue: { primaryColor: '#2563EB', backgroundColor: '#FFFFFF', textColor: '#1F2937' },
  green: { primaryColor: '#059669', backgroundColor: '#FFFFFF', textColor: '#1F2937' },
  purple: { primaryColor: '#7C3AED', backgroundColor: '#FFFFFF', textColor: '#1F2937' },
  red: { primaryColor: '#DC2626', backgroundColor: '#FFFFFF', textColor: '#1F2937' },
  dark: { primaryColor: '#60A5FA', backgroundColor: '#111827', textColor: '#F9FAFB' },
  light: { primaryColor: '#2563EB', backgroundColor: '#F8FAFC', textColor: '#1F2937' },
}

// ---- 메인 AI 처리 함수 ----

export async function processMessage(
  userInput: string,
  currentDesign: DesignJSON | null
): Promise<AIResponse> {
  // 실제 API 연동 시 이 부분을 교체한다
  // 현재는 500ms 딜레이로 AI 처리를 시뮬레이션한다
  await new Promise(resolve => setTimeout(resolve, 600))

  const intent = detectIntent(userInput)

  switch (intent) {
    case 'create-resume':
      return {
        message: '이력서를 생성했습니다! 이름, 직함, 경력 내용을 수정해보세요. "블루톤으로 바꿔줘" 같은 명령도 가능합니다.',
        updatedDesign: JSON.parse(JSON.stringify(resumeTemplate)), // 깊은 복사
        action: 'create',
      }

    case 'create-portfolio':
      return {
        message: '포트폴리오를 생성했습니다! 프로젝트 카드 내용을 수정해보세요.',
        updatedDesign: JSON.parse(JSON.stringify(portfolioTemplate)),
        action: 'create',
      }

    case 'theme-blue':
    case 'theme-green':
    case 'theme-purple':
    case 'theme-red':
    case 'theme-dark':
    case 'theme-light': {
      if (!currentDesign) return noDesignError()
      const colorKey = intent.replace('theme-', '') as keyof typeof themePresets
      const preset = themePresets[colorKey]
      const updated: DesignJSON = {
        ...currentDesign,
        page: {
          ...currentDesign.page,
          theme: { ...currentDesign.page.theme, ...preset },
        },
      }
      const colorNames: Record<string, string> = {
        blue: '블루', green: '그린', purple: '퍼플', red: '레드', dark: '다크', light: '라이트',
      }
      return {
        message: `${colorNames[colorKey]} 테마로 변경했습니다.`,
        updatedDesign: updated,
        action: 'update-theme',
      }
    }

    case 'reduce-padding': {
      if (!currentDesign) return noDesignError()
      const updated: DesignJSON = {
        ...currentDesign,
        page: {
          ...currentDesign.page,
          layout: { ...currentDesign.page.layout, padding: '8mm' },
        },
      }
      return {
        message: '여백을 줄였습니다. (14mm → 8mm)',
        updatedDesign: updated,
        action: 'update-layout',
      }
    }

    case 'increase-padding': {
      if (!currentDesign) return noDesignError()
      const updated: DesignJSON = {
        ...currentDesign,
        page: {
          ...currentDesign.page,
          layout: { ...currentDesign.page.layout, padding: '20mm' },
        },
      }
      return {
        message: '여백을 늘렸습니다. (14mm → 20mm)',
        updatedDesign: updated,
        action: 'update-layout',
      }
    }

    case 'move-projects-up': {
      if (!currentDesign) return noDesignError()
      const newSections = moveSectionUp(currentDesign.page.sections, 'project')
      return {
        message: '프로젝트 섹션을 위로 이동했습니다.',
        updatedDesign: { ...currentDesign, page: { ...currentDesign.page, sections: newSections } },
        action: 'move-section',
      }
    }

    case 'move-experience-up': {
      if (!currentDesign) return noDesignError()
      const newSections = moveSectionUp(currentDesign.page.sections, 'experience')
      return {
        message: '경력 섹션을 위로 이동했습니다.',
        updatedDesign: { ...currentDesign, page: { ...currentDesign.page, sections: newSections } },
        action: 'move-section',
      }
    }

    case 'increase-font': {
      if (!currentDesign) return noDesignError()
      const currentSize = currentDesign.page.theme.fontSize?.base ?? 14
      const updated: DesignJSON = {
        ...currentDesign,
        page: {
          ...currentDesign.page,
          theme: {
            ...currentDesign.page.theme,
            fontSize: { base: currentSize + 2, heading: (currentDesign.page.theme.fontSize?.heading ?? 20) + 2 },
          },
        },
      }
      return {
        message: `폰트 크기를 키웠습니다. (${currentSize}px → ${currentSize + 2}px)`,
        updatedDesign: updated,
        action: 'update-theme',
      }
    }

    case 'decrease-font': {
      if (!currentDesign) return noDesignError()
      const currentSize = currentDesign.page.theme.fontSize?.base ?? 14
      const newSize = Math.max(10, currentSize - 2)
      const updated: DesignJSON = {
        ...currentDesign,
        page: {
          ...currentDesign.page,
          theme: {
            ...currentDesign.page.theme,
            fontSize: { base: newSize, heading: Math.max(14, (currentDesign.page.theme.fontSize?.heading ?? 20) - 2) },
          },
        },
      }
      return {
        message: `폰트 크기를 줄였습니다. (${currentSize}px → ${newSize}px)`,
        updatedDesign: updated,
        action: 'update-theme',
      }
    }

    case 'greet':
      return {
        message: '안녕하세요! Lumio입니다 👋\n\n"이력서 만들어줘" 또는 "포트폴리오 만들어줘"로 시작해보세요!\n\n생성 후에는 "블루톤으로 바꿔줘", "여백 줄여줘" 같은 수정 명령도 사용할 수 있습니다.',
        action: 'none',
      }

    case 'help':
      return {
        message: '현재 사용 가능한 명령어:\n\n**생성**\n• "이력서 만들어줘"\n• "포트폴리오 만들어줘"\n\n**테마 변경**\n• "블루/그린/퍼플/레드/다크/라이트 테마로 바꿔줘"\n\n**레이아웃**\n• "여백 줄여줘 / 늘려줘"\n• "폰트 키워줘 / 줄여줘"\n\n**섹션 이동**\n• "프로젝트 섹션 위로 올려줘"\n• "경력 위로 올려줘"',
        action: 'none',
      }

    default:
      return {
        message: `"${userInput}"은 아직 지원하지 않는 명령입니다.\n\n"도움말"을 입력하면 사용 가능한 명령어를 볼 수 있습니다.`,
        action: 'none',
      }
  }
}

function noDesignError(): AIResponse {
  return {
    message: '먼저 디자인을 생성해주세요. "이력서 만들어줘"로 시작할 수 있습니다.',
    action: 'none',
  }
}
