// Naver OAuth 콜백 처리 Edge Function
// 흐름: Naver 인가코드 → 토큰 교환 → 유저 정보 조회 → Supabase 유저 upsert → 매직링크 발급 → 앱으로 리디렉트

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const NAVER_TOKEN_URL = 'https://nid.naver.com/oauth2.0/token'
const NAVER_PROFILE_URL = 'https://openapi.naver.com/v1/nid/me'

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code  = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const appUrl       = Deno.env.get('APP_URL') ?? 'http://localhost:5173'
  const clientId     = Deno.env.get('NAVER_CLIENT_ID') ?? ''
  const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET') ?? ''

  function redirect(err: string) {
    return Response.redirect(`${appUrl}?auth_error=${err}`, 302)
  }

  if (!code) return redirect('no_code')

  try {
    // 1. 인가코드 → 네이버 액세스 토큰
    const tokenRes = await fetch(NAVER_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     clientId,
        client_secret: clientSecret,
        code,
        state: state ?? '',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) return redirect('token_failed')

    // 2. 네이버 유저 프로필
    const profileRes = await fetch(NAVER_PROFILE_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profileData = await profileRes.json()
    const profile = profileData.response as {
      email?: string
      name?: string
      profile_image?: string
    }

    if (!profile?.email) return redirect('no_email')

    // 3. Supabase Admin 클라이언트 (service_role 키 필요)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 유저가 없으면 생성, 있으면 메타데이터 갱신
    const { error: createErr } = await supabase.auth.admin.createUser({
      email: profile.email,
      email_confirm: true,
      user_metadata: {
        full_name:  profile.name,
        avatar_url: profile.profile_image,
        provider:   'naver',
      },
    })

    // "이미 가입된 이메일" 오류는 무시하고 메타데이터만 업데이트
    if (createErr && createErr.message.includes('already')) {
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
      const existing = listData?.users.find(u => u.email === profile.email)
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, {
          user_metadata: {
            full_name:  profile.name,
            avatar_url: profile.profile_image,
            provider:   'naver',
          },
        })
      }
    }

    // 4. 매직링크 생성 (유저를 앱으로 자동 로그인시키는 일회용 URL)
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
      options: { redirectTo: appUrl },
    })

    if (linkErr || !linkData?.properties?.action_link) return redirect('link_failed')

    return Response.redirect(linkData.properties.action_link, 302)

  } catch (err) {
    console.error('[naver-auth]', err)
    return redirect('server_error')
  }
})
