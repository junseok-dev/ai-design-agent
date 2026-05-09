# Lumio

AI 기반 대화형 디자인 플랫폼입니다. 사용자는 채팅으로 이력서와 포트폴리오를 만들고, Lumio는 AI가 생성한 `DesignJSON`을 React 렌더링 엔진으로 화면에 그립니다. AI는 HTML/CSS를 직접 생성하지 않습니다.

## Stack

- React 18, TypeScript, Vite
- Tailwind CSS
- Zustand
- Supabase Auth, PostgreSQL, RLS
- OpenAI, Claude, Gemini
- `@dnd-kit` drag and drop
- `react-to-print` PDF export

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Supabase 값을 입력합니다.

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_NAVER_CLIENT_ID=your-naver-client-id
```

OpenAI, Claude, Gemini API 키는 앱 온보딩에서 사용자가 직접 입력합니다. 운영 환경 변수에 AI provider secret key를 넣지 않습니다.

## Supabase Setup

Supabase SQL editor에서 아래 마이그레이션을 순서대로 실행합니다.

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_public_documents.sql`

`002_public_documents.sql`은 공유 링크에 필요합니다.

```sql
alter table public.documents
  add column if not exists is_public boolean not null default false;

create policy "public documents are readable"
  on public.documents for select
  using (is_public = true);
```

이 마이그레이션이 적용되지 않으면 `Share` 버튼은 `is_public` 컬럼 오류가 나거나, `/share/:documentId` 페이지에서 공개 문서를 읽지 못합니다.

## OAuth Setup

Supabase Auth에서 사용하는 provider를 켭니다.

- Google
- GitHub
- Discord
- Naver: `supabase/functions/naver-auth` Edge Function 사용

배포 후에는 Supabase Auth URL 설정에 운영 도메인을 추가합니다.

- Site URL: `https://your-domain.com`
- Redirect URLs:
  - `https://your-domain.com`
  - `https://your-domain.com/share/*`

각 OAuth provider 콘솔에도 Supabase callback URL을 등록해야 합니다.

## Deployment

### Vercel

이 저장소에는 `vercel.json`이 포함되어 있습니다. `/share/:documentId` 같은 SPA 경로가 새로고침되어도 `index.html`로 rewrite됩니다.

Build settings:

- Build command: `npm run build`
- Output directory: `dist`

Environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NAVER_CLIENT_ID`

### Netlify

`netlify.toml`과 `public/_redirects`가 포함되어 있습니다.

Build settings:

- Build command: `npm run build`
- Publish directory: `dist`

## QA Checklist

- Login with enabled OAuth providers
- Create a resume from AI chat
- Edit via AI streaming response
- Discuss mode does not change design
- Local refresh keeps documents and chat history
- Theme editor updates live preview
- Add section opens editor automatically
- A4/Web preview toggle works
- PDF export opens print dialog
- Share button copies `/share/:documentId`
- Shared URL opens while logged out

## Scripts

```bash
npm run dev
npm run build
npm run preview
```
