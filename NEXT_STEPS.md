# Lumio Next Steps

## Current Known Issues

- Discord login is not working.
- Naver login is not working.
- Share links are not working yet.
- Share flow currently needs deeper Supabase/Auth debugging beyond the UI changes already made.

## Next Priorities

1. Fix Supabase Auth provider setup
   - Verify Supabase Auth provider settings for Discord.
   - Verify OAuth app callback URLs in the Discord developer console.
   - Confirm deployed and local redirect URLs are both allowed in Supabase.

2. Fix Naver login
   - Verify `VITE_NAVER_CLIENT_ID`.
   - Verify the Naver developer console redirect URI.
   - Test the Supabase Edge Function `supabase/functions/naver-auth`.
   - Confirm the Edge Function has the required secrets and callback handling.

3. Fix share links
   - Re-check that `001_init.sql` and `002_public_documents.sql` have both been applied in Supabase.
   - Confirm `documents.is_public` exists in the live database.
   - Confirm public `select` policy works for `anon`.
   - Test saving a public document directly from Supabase SQL.
   - Test `/share/:documentId` in a logged-out browser session.

4. Clean remaining broken UI text
   - `SectionEditorPanel`
   - `DocumentList`
   - `OnboardingWizard`
   - `LoginPage`
   - `TemplateGallery`
   - `aiConfig`

5. Production QA
   - Test OpenAI, Claude, and Gemini with real user-entered API keys.
   - Test Edit and Discuss chat histories after refresh.
   - Test A4/Web preview mode.
   - Test PDF export.
   - Test local persistence after browser refresh and dev server restart.

## Suggested Commit Message

```text
feat: add editor tooling, chat modes, persistence, and deployment prep

- add theme editor and live preview updates
- add section insertion with default section templates
- add streaming AI responses for OpenAI, Claude, and Gemini
- add separate Edit and Discuss chat modes with independent histories
- persist active document and chat histories in localStorage
- add A4/Web preview toggle
- add initial share page, public document migration, and deployment rewrites
- document Supabase setup and deployment checklist

Known issues:
- Discord login is not working
- Naver login is not working
- Share links are not working yet
```
