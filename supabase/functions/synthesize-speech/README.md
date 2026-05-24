# synthesize-speech

Edge Function that proxies Google Cloud Text-to-Speech so the API key stays server-side.

**Required secret:** Set `TTS_GOOGLE_API_KEY` in the Supabase project (Dashboard → Project Settings → Edge Functions → Secrets, or `supabase secrets set TTS_GOOGLE_API_KEY=your-key`).

Use a server-side Google Cloud key here. A browser/referrer-restricted key will typically fail from the edge function with `403`.

Deploy with: `supabase functions deploy synthesize-speech`
