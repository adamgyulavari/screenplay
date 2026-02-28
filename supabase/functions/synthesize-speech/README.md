# synthesize-speech

Edge Function that proxies Google Cloud Text-to-Speech so the API key stays server-side.

**Required secret:** Set `TTS_GOOGLE_API_KEY` in the Supabase project (Dashboard → Project Settings → Edge Functions → Secrets, or `supabase secrets set TTS_GOOGLE_API_KEY=your-key`).

Deploy with: `supabase functions deploy synthesize-speech`
