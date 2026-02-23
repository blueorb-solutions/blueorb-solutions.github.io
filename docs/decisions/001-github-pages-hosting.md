# 001 — Use GitHub Pages for hosting

## Status: Accepted

## Context
Needed free, reliable hosting for a static business landing page with a custom
domain (`blueorb-solutions.com`). The site is pure HTML/CSS/JS — no server-side
logic required. The source code is managed in a GitHub organization account
(`blueorb-solutions`).

## Decision
Use GitHub Pages via GitHub Actions on the `blueorb-solutions` org account.
Deployment is automated — every merge to `main` triggers the workflow in
`.github/workflows/deploy.yml` which uploads static files as a Pages artifact.

## Alternatives considered

| Option | Reason rejected |
|--------|----------------|
| Netlify | Vendor lock-in; account tied to personal email |
| Vercel | Free tier limits apply to org/team accounts |
| AWS S3 + CloudFront | Powerful but adds cost and operational overhead for a static site |
| Self-hosted VPS | Ongoing maintenance, cost, no built-in SSL |

## Consequences

✅ Free forever on public repos
✅ Auto-deploys on push to `main` via GitHub Actions
✅ Custom domain (`www.blueorb-solutions.com`) with free SSL (Let's Encrypt)
✅ No vendor account beyond GitHub
⚠️  Repo must stay **public** for Pages to work on the free org plan
⚠️  Static files only — no server-side code on GitHub Pages
