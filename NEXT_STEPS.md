# Lumio 다음 작업 정리

## 현재 알려진 문제

- Discord 로그인이 아직 동작하지 않음
- Naver 로그인이 아직 동작하지 않음
- 공유 링크 기능이 아직 동작하지 않음
- 공유 기능은 UI 수정만으로 끝나지 않고 Supabase/Auth 쪽 추가 디버깅이 필요함

## 다음 우선순위

1. Supabase Auth Provider 설정 점검
   - Supabase의 Discord provider 설정 확인
   - Discord 개발자 콘솔의 OAuth callback URL 확인
   - 로컬 URL과 배포 URL이 Supabase Redirect URLs에 모두 등록되어 있는지 확인

2. Naver 로그인 수정
   - `VITE_NAVER_CLIENT_ID` 값 확인
   - Naver 개발자 콘솔의 redirect URI 확인
   - `supabase/functions/naver-auth` Edge Function 테스트
   - Edge Function에 필요한 secrets와 callback 처리 확인

3. 공유 링크 수정
   - Supabase에 `001_init.sql`, `002_public_documents.sql`이 모두 적용됐는지 확인
   - 실제 DB의 `documents` 테이블에 `is_public` 컬럼이 있는지 확인
   - `anon` role이 공개 문서를 읽을 수 있는지 RLS 정책 확인
   - Supabase SQL에서 직접 공개 문서 저장/조회 테스트
   - 로그아웃 또는 시크릿 창에서 `/share/:documentId` 접근 테스트

4. 깨진 UI 문구 정리
   - `SectionEditorPanel`
   - `DocumentList`
   - `OnboardingWizard`
   - `LoginPage`
   - `TemplateGallery`
   - `aiConfig`

5. 실제 사용 QA
   - OpenAI, Claude, Gemini 실제 사용자 API 키로 테스트
   - Edit / Discuss 대화 기록이 새로고침 후 유지되는지 확인
   - A4 / Web 미리보기 전환 확인
   - PDF 출력 확인
   - 브라우저 새로고침 및 dev server 재시작 후 로컬 저장 유지 확인

## 추천 커밋 메시지

```text
feat: 에디터 기능, 채팅 모드, 로컬 저장, 배포 준비 추가

- 테마 편집기와 라이브 프리뷰 반영 추가
- 섹션 추가 기능과 섹션 기본값 추가
- OpenAI, Claude, Gemini 응답 스트리밍 추가
- Edit / Discuss 채팅 모드 분리
- Edit / Discuss 대화 기록을 각각 독립적으로 저장
- 활성 문서와 채팅 기록을 localStorage에 저장
- A4 / Web 미리보기 토글 추가
- 공유 페이지, 공개 문서 마이그레이션, 배포 rewrite 설정 추가
- Supabase 설정과 배포 체크리스트 문서화

현재 알려진 문제:
- Discord 로그인 미동작
- Naver 로그인 미동작
- 공유 링크 미동작
```
