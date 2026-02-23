# BlueOrb Solutions — Architecture Overview

> This document explains how the website is built, deployed, and how the contact
> form works end-to-end. All diagrams are rendered automatically on GitHub.

---

## 1. Component Map — What lives where

```mermaid
graph TD
    subgraph LOCAL["💻 Local Machine"]
        SRC["Source Files\nindex.html · styles.css\nscript.js · config.js"]
        WTOML["worker/wrangler.toml\nNon-secret config"]
        WIDX["worker/src/index.js\nWorker code"]
    end

    subgraph GITHUB["🐙 GitHub — blueorb-solutions org"]
        REPO["blueorb-solutions.github.io\n(public repo)"]
        GA["GitHub Actions\ndeploy.yml\nAuto-deploys on push to main"]
        PAGES["GitHub Pages\nwww.blueorb-solutions.com"]
        REPO --> GA --> PAGES
    end

    subgraph DNS["🌐 Squarespace DNS"]
        AREC["A records ×4\nblueorb-solutions.com → GitHub IPs"]
        CNAME["CNAME\nwww → blueorb-solutions.github.io"]
    end

    subgraph CF["☁️ Cloudflare"]
        WORKER["blueorb-contact-worker\nEdge serverless function"]
        SECRET[("🔐 ZEPTO_API_KEY\nCloudflare Secret\n(encrypted, write-only)")]
        SECRET -. injected at runtime .-> WORKER
    end

    subgraph ZOHO["📧 Zoho"]
        ZEPTO["ZeptoMail\nTransactional email API"]
        INBOX["Zoho Mail Inbox\nsales@blueorb-solutions.com"]
        ZEPTO --> INBOX
    end

    SRC -- git push + PR merge --> REPO
    WIDX & WTOML -- wrangler deploy --> WORKER
    DNS --> PAGES
    PAGES -- serves --> SRC
    WORKER --> ZEPTO
```

---

## 2. Contact Form — Step-by-step submission flow

```mermaid
sequenceDiagram
    actor Visitor
    participant Browser as Browser<br/>(script.js)
    participant Worker as Cloudflare Worker<br/>(blueorbsolutions.workers.dev)
    participant ZeptoMail as ZeptoMail API<br/>(api.zeptomail.com)
    participant Inbox as Zoho Mail Inbox<br/>(sales@blueorb-solutions.com)

    Visitor->>Browser: Fills form and clicks Send
    Browser->>Browser: Disables button, shows "Sending…"
    Browser->>Worker: POST /  { name, email, subject, message }
    Note over Browser,Worker: JSON over HTTPS · CORS checks origin

    Worker->>Worker: Validate fields
    Worker->>Worker: Check Origin header vs ALLOWED_ORIGIN
    Worker->>ZeptoMail: POST /v1.1/email<br/>Authorization: ZEPTO_API_KEY (secret)<br/>from: noreply@blueorb-solutions.com<br/>to: sales@blueorb-solutions.com<br/>reply_to: visitor's email

    ZeptoMail-->>Worker: 200 OK · Email request received
    Worker-->>Browser: 200 OK
    Browser->>Browser: Re-enables button
    Browser->>Visitor: ✅ "Message sent! We'll be in touch soon."

    Inbox-->>Visitor: You reply in Zoho Mail → goes to visitor's email (Reply-To)
```

---

## 3. Deployment Pipeline — How code goes from local to production

```mermaid
flowchart LR
    DEV["💻 Local Dev\nnpx serve\nlocalhost:3000"]

    subgraph GIT["Git Workflow"]
        direction TB
        FB["Feature Branch\nfeature/xyz"]
        PR["Pull Request\nReview on GitHub"]
        MAIN["main branch"]
        FB --> PR --> MAIN
    end

    subgraph AUTODEPLOY["Automatic on merge to main"]
        direction TB
        GA["GitHub Actions\ndeploy.yml"]
        ARTIFACT["Pages Artifact\n(static files)"]
        PROD["🌐 Production\nwww.blueorb-solutions.com"]
        GA --> ARTIFACT --> PROD
    end

    subgraph WORKER_DEPLOY["Manual — Cloudflare Worker"]
        direction TB
        WRANGLER["wrangler deploy\n(run from /worker)"]
        CF["☁️ Cloudflare Edge\nblueorb-contact-worker"]
        WRANGLER --> CF
    end

    DEV -- "git push" --> GIT
    MAIN --> AUTODEPLOY
    MAIN -- "cd worker &&\nwrangler deploy" --> WORKER_DEPLOY
```

---

## 4. Configuration Map — What to edit and where

```mermaid
flowchart TD
    subgraph CHANGE["I want to change…"]
        A["The Worker URL"]
        B["Destination email address\n(TO_EMAIL)"]
        C["Sender name / address\n(FROM_NAME / FROM_EMAIL)"]
        D["Allowed CORS origins"]
        E["ZeptoMail API key"]
        F["Site content / styling"]
    end

    subgraph FILES["Edit this file"]
        CJS["config.js"]
        TOML["worker/wrangler.toml\nthen: wrangler deploy"]
        SECRET["wrangler secret put ZEPTO_API_KEY\n(never stored in a file)"]
        SITE["index.html / styles.css / script.js\nthen: PR → merge"]
    end

    A --> CJS
    B --> TOML
    C --> TOML
    D --> TOML
    E --> SECRET
    F --> SITE
```

---

## 5. Security Boundaries

```mermaid
flowchart LR
    subgraph PUBLIC["🌍 Public — anyone can see"]
        HTML["index.html"]
        CSS["styles.css"]
        JS["script.js"]
        CFG["config.js\n(Worker URL only)"]
        TOML_PUB["worker/wrangler.toml\n(email addresses, CORS)"]
    end

    subgraph PRIVATE["🔐 Private — never exposed"]
        KEY["ZEPTO_API_KEY\nCloudflare encrypted secret"]
    end

    subgraph EDGE["☁️ Cloudflare Edge — server-side only"]
        ENV["env.ZEPTO_API_KEY\nenv.FROM_EMAIL · env.TO_EMAIL\nenv.ALLOWED_ORIGIN"]
    end

    KEY -. "injected at runtime\nnever sent to browser" .-> ENV
    TOML_PUB -. "deployed as env vars\nnever sent to browser" .-> ENV
```
