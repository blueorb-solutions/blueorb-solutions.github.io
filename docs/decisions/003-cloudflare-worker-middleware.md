# 003 — Use Cloudflare Worker as secure middleware

## Status: Accepted

## Context
The ZeptoMail API key must never appear in browser source code — any visitor
could extract it and abuse the sending quota. The site is static (GitHub Pages)
with no backend server. Needed a lightweight, secure layer to hold the API key
and proxy contact form submissions to ZeptoMail.

## Decision
Deploy a **Cloudflare Worker** (`blueorb-contact-worker`) that:
1. Receives `POST` requests from the contact form
2. Validates required fields
3. Checks the `Origin` header against an allow-list (production + localhost)
4. Calls the ZeptoMail API with the secret key injected from Cloudflare's vault
5. Returns success/error JSON back to the browser

Non-secret config (`FROM_EMAIL`, `TO_EMAIL`, `ALLOWED_ORIGIN`) lives in
`worker/wrangler.toml`. The `ZEPTO_API_KEY` is stored as a Cloudflare secret
via `wrangler secret put` and is never written to any file.

## Alternatives considered

| Option | Reason rejected |
|--------|----------------|
| Browser-side API call | API key exposed in source — rejected |
| AWS Lambda + API Gateway | Full control but complex IAM setup, slower iteration |
| Netlify Functions | Ties hosting platform to Netlify |
| Vercel Edge Functions | Ties hosting to Vercel |

## Consequences

✅ Free: 100,000 requests/day on Cloudflare's free tier
✅ API key never in any file or visible to browser
✅ CORS locked to production domain + localhost (for local dev)
✅ Runs at Cloudflare's edge — low latency globally
⚠️  Worker is deployed separately from the site (`wrangler deploy`)
⚠️  Two config locations: `config.js` (browser-side) and `wrangler.toml` (Worker-side)
