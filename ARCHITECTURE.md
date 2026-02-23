# BlueOrb Solutions — Architecture

## Contact Form Flow

> Visitor submits the form → Cloudflare Worker validates & relays → email lands in the Zoho inbox.
> Replying in Zoho Mail goes straight back to the visitor (via Reply-To).

```mermaid
flowchart LR
    VIS(["👤 Visitor"])

    subgraph SITE ["🌐  GitHub Pages  ·  www.blueorb-solutions.com"]
        direction TB
        FORM["📝 Contact Form\nindex.html"]
        JS["script.js\nasync fetch POST"]
        FORM --> JS
    end

    subgraph WORKER ["☁️  Cloudflare Worker  ·  blueorb-contact-worker"]
        direction TB
        VAL["✅ Validate fields\n+ CORS origin check"]
        KEY[("🔐 ZEPTO_API_KEY\nCloudflare secret")]
        KEY -. injected at runtime .-> VAL
    end

    subgraph ZOHO ["📧  Zoho"]
        direction TB
        ZEPTO["ZeptoMail API\ntransactional email"]
        INBOX["📥 Inbox\nsales@blueorb-solutions.com"]
        ZEPTO --> INBOX
    end

    VIS    -->|"fills & submits"| FORM
    JS     -->|"POST  ·  name  email  subject  message"| VAL
    VAL    -->|"from: noreply@  ·  reply_to: visitor"| ZEPTO
    INBOX  -. "Hit Reply → goes straight to visitor" .-> VIS
    JS     -. "✅  Message sent! We'll be in touch soon." .-> VIS
```

---

## Key Files

| What you want to change | File to edit |
|-------------------------|--------------|
| Worker URL (browser side) | `config.js` |
| Destination / sender email, CORS | `worker/wrangler.toml` → `wrangler deploy` |
| ZeptoMail API key | `wrangler secret put ZEPTO_API_KEY` (never stored in a file) |
| Site content / styling | `index.html` / `styles.css` / `script.js` → PR → merge |

---

## Decisions

See [`docs/decisions/`](docs/decisions/) for Architecture Decision Records (ADRs).
