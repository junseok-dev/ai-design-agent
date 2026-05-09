// ============================================================
// 초기 템플릿 모음
// AI가 "이력서 만들어줘" 같은 요청을 받으면 이 템플릿을 기반으로 응답한다
// ============================================================

import type { DesignJSON } from '../types/design'

export const resumeTemplate: DesignJSON = {
  page: {
    type: 'a4-resume',
    theme: {
      primaryColor: '#2563EB',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      secondaryColor: '#6B7280',
      fontFamily: 'Inter',
      fontSize: { base: 14, heading: 20 },
    },
    layout: {
      width: '210mm',
      height: '297mm',
      padding: '14mm',
    },
    sections: [
      {
        id: 'header',
        type: 'hero',
        props: {
          title: '박준석',
          subtitle: 'Frontend Developer',
          description: '사용자 경험을 최우선으로 생각하는 프론트엔드 개발자입니다.',
          tags: ['React', 'TypeScript', 'Next.js'],
        },
        style: { align: 'left' },
      },
      {
        id: 'contact',
        type: 'contact-info',
        props: {
          items: [
            { type: 'email', value: 'dev@example.com' },
            { type: 'github', value: 'github.com/example' },
            { type: 'phone', value: '010-1234-5678' },
            { type: 'location', value: '서울, 대한민국' },
          ],
          layout: 'horizontal',
        },
      },
      {
        id: 'divider-1',
        type: 'divider',
        props: { style: 'line', margin: 8 },
      },
      {
        id: 'summary',
        type: 'text-block',
        props: {
          heading: '자기소개',
          body: '3년간 React 기반 웹 서비스를 개발해왔으며, 복잡한 상태 관리와 성능 최적화에 강점이 있습니다. 팀과의 원활한 소통을 중시하고, 코드 품질과 사용자 경험 모두를 중요하게 생각합니다.',
        },
      },
      {
        id: 'skills',
        type: 'skill-list',
        props: {
          heading: '기술 스택',
          skills: [
            { name: 'React', level: 90, category: 'Frontend' },
            { name: 'TypeScript', level: 85, category: 'Frontend' },
            { name: 'Next.js', level: 80, category: 'Frontend' },
            { name: 'Tailwind CSS', level: 90, category: 'Frontend' },
            { name: 'Node.js', level: 65, category: 'Backend' },
            { name: 'PostgreSQL', level: 60, category: 'Database' },
          ],
          displayStyle: 'tags',
        },
      },
      {
        id: 'experience',
        type: 'timeline',
        props: {
          heading: '경력',
          items: [
            {
              period: '2022.03 ~ 현재',
              title: 'Frontend Developer',
              organization: '(주) 테크스타트',
              description: 'React 기반 SaaS 대시보드 개발. 상태관리 Zustand 도입 및 성능 최적화로 렌더링 시간 40% 단축.',
              tags: ['React', 'TypeScript', 'Zustand'],
            },
            {
              period: '2021.01 ~ 2022.02',
              title: 'Junior Developer',
              organization: '(주) 웹에이전시',
              description: '다양한 기업 웹사이트 퍼블리싱 및 React 컴포넌트 개발.',
              tags: ['React', 'SCSS'],
            },
          ],
        },
      },
      {
        id: 'education',
        type: 'timeline',
        props: {
          heading: '학력',
          items: [
            {
              period: '2017.03 ~ 2021.02',
              title: '컴퓨터공학 학사',
              organization: '한국대학교',
              description: '소프트웨어 공학, 자료구조, 알고리즘 전공',
            },
          ],
        },
      },
      {
        id: 'projects',
        type: 'card-grid',
        props: {
          heading: '프로젝트',
          columns: 2,
          cards: [
            {
              title: 'Lumio Design Platform',
              subtitle: '2024.01 ~ 진행 중',
              description: 'AI 기반 대화형 디자인 생성 플랫폼. React + TypeScript + Claude API 활용.',
              tags: ['React', 'AI', 'TypeScript'],
            },
            {
              title: 'E-Commerce Dashboard',
              subtitle: '2023.06 ~ 2023.12',
              description: '실시간 판매 분석 대시보드. Recharts + React Query로 데이터 시각화 구현.',
              tags: ['React', 'Recharts', 'React Query'],
            },
          ],
        },
      },
    ],
  },
}

// 포트폴리오 템플릿 (추후 확장)
export const portfolioTemplate: DesignJSON = {
  page: {
    type: 'portfolio',
    theme: {
      primaryColor: '#7C3AED',
      backgroundColor: '#FAFAFA',
      textColor: '#111827',
      secondaryColor: '#9CA3AF',
      fontFamily: 'Inter',
    },
    layout: {
      width: '210mm',
      height: '297mm',
      padding: '16mm',
    },
    sections: [
      {
        id: 'header',
        type: 'hero',
        props: {
          title: '포트폴리오',
          subtitle: 'UX/UI Designer & Developer',
          description: '디자인과 개발의 경계를 넘나드는 크리에이터.',
        },
        style: { align: 'center' },
      },
      {
        id: 'projects',
        type: 'card-grid',
        props: {
          heading: '주요 작업물',
          columns: 2,
          cards: [
            { title: '프로젝트 1', description: '설명을 입력하세요.', tags: ['UI/UX'] },
            { title: '프로젝트 2', description: '설명을 입력하세요.', tags: ['Design'] },
          ],
        },
      },
    ],
  },
}

export const resumeMinimalTemplate: DesignJSON = {
  page: {
    type: 'a4-resume',
    theme: {
      primaryColor: '#059669',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      secondaryColor: '#6B7280',
      fontFamily: 'Inter',
      fontSize: { base: 13, heading: 18 },
    },
    layout: { width: '210mm', height: '297mm', padding: '16mm' },
    sections: [
      {
        id: 'header',
        type: 'hero',
        props: { title: '이름', subtitle: 'Job Title', description: '한 줄 소개를 작성해주세요.', tags: [] },
        style: { align: 'center' },
      },
      { id: 'divider-1', type: 'divider', props: { style: 'line', margin: 10 } },
      {
        id: 'contact',
        type: 'contact-info',
        props: {
          items: [
            { type: 'email', value: 'email@example.com' },
            { type: 'phone', value: '010-0000-0000' },
            { type: 'github', value: 'github.com/username' },
          ],
          layout: 'horizontal',
        },
      },
      { id: 'divider-2', type: 'divider', props: { style: 'line', margin: 10 } },
      { id: 'summary', type: 'text-block', props: { heading: '자기소개', body: '자기소개를 작성해주세요.' } },
      {
        id: 'skills',
        type: 'skill-list',
        props: {
          heading: '기술 스택',
          skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'TypeScript' }, { name: 'Node.js' }],
          displayStyle: 'tags',
        },
      },
      {
        id: 'experience',
        type: 'timeline',
        props: {
          heading: '경력',
          items: [{ period: '2022 ~ 현재', title: '개발자', organization: '회사명', description: '주요 업무를 작성하세요.' }],
        },
      },
    ],
  },
}

export const resumeDarkTemplate: DesignJSON = {
  page: {
    type: 'a4-resume',
    theme: {
      primaryColor: '#818CF8',
      backgroundColor: '#0F172A',
      textColor: '#E2E8F0',
      secondaryColor: '#94A3B8',
      fontFamily: 'Inter',
      fontSize: { base: 13, heading: 19 },
    },
    layout: { width: '210mm', height: '297mm', padding: '15mm' },
    sections: [
      {
        id: 'header',
        type: 'hero',
        props: { title: '이름', subtitle: 'Full-Stack Developer', description: '풀스택 개발자입니다. 백엔드와 프론트엔드 모두를 다룹니다.', tags: ['Node.js', 'React', 'PostgreSQL'] },
        style: { align: 'left' },
      },
      {
        id: 'contact',
        type: 'contact-info',
        props: {
          items: [
            { type: 'email', value: 'dev@example.com' },
            { type: 'github', value: 'github.com/dev' },
            { type: 'linkedin', value: 'linkedin.com/in/dev' },
          ],
          layout: 'horizontal',
        },
      },
      { id: 'divider-1', type: 'divider', props: { style: 'line', margin: 10 } },
      { id: 'summary', type: 'text-block', props: { heading: '소개', body: '5년간 SaaS 제품을 개발해왔습니다. 확장 가능한 아키텍처 설계와 성능 최적화를 좋아합니다.' } },
      {
        id: 'skills',
        type: 'skill-list',
        props: {
          heading: '기술',
          skills: [
            { name: 'TypeScript', level: 90 }, { name: 'React', level: 88 },
            { name: 'Node.js', level: 85 }, { name: 'PostgreSQL', level: 78 },
          ],
          displayStyle: 'bars',
        },
      },
      {
        id: 'experience',
        type: 'timeline',
        props: {
          heading: '경력',
          items: [
            { period: '2022 ~ 현재', title: 'Senior Developer', organization: 'Tech Corp', description: '핵심 API 개발 및 팀 리드.' },
            { period: '2019 ~ 2022', title: 'Developer', organization: 'Startup Inc', description: 'MVP 개발 및 서비스 런칭.' },
          ],
        },
      },
    ],
  },
}

export const templates: Record<string, DesignJSON> = {
  resume: resumeTemplate,
  'resume-minimal': resumeMinimalTemplate,
  'resume-dark': resumeDarkTemplate,
  portfolio: portfolioTemplate,
}
