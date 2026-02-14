# Kakao Login Setup (Supabase OAuth)

## Summary
This project can use Kakao OAuth through Supabase Authentication Providers.

## Steps
1. Create an app in Kakao Developers.
2. Copy REST API key (Client ID).
3. Create and enable Client Secret.
4. Register Supabase callback URL as Redirect URI.
5. In Supabase, enable Kakao provider and paste Client ID/Secret.
6. Save and test login flow.

## Troubleshooting
- Invalid redirect URI: confirm exact URL match.
- Client auth failed: re-check Client ID and Secret.
- No session after login: check auth callback and app logs.
