# 002 — Use ZeptoMail for contact form email delivery

## Status: Accepted

## Context
The contact form originally used `mailto:` which opens the visitor's local email
client (Outlook, Apple Mail, etc.) before sending. Many visitors abandon this
step. Needed silent, direct delivery to `sales@blueorb-solutions.com` with no
popup. The site is fully static — no server to run SMTP.

## Decision
Use **ZeptoMail** (Zoho's transactional email API) called from a Cloudflare Worker.
ZeptoMail was chosen because the business already pays for Zoho Mail. The API key
is stored as a Cloudflare secret and never exposed to the browser.

## Alternatives considered

| Option | Reason rejected |
|--------|----------------|
| `mailto:` | Opens visitor's email client — many visitors abandon |
| Formspree | Third party stores form data; rejected on privacy grounds |
| Web3Forms | API key exposed in browser source (acceptable risk but not preferred) |
| EmailJS | API key exposed in browser source |
| SendGrid | Paid after 100/day free; adds a new vendor outside Zoho ecosystem |
| Mailgun | Only 1,000 emails/month free for 3 months, then paid |
| AWS SES + Lambda | Most controlled but 3-4 hr setup; requires SES sandbox exit approval |

## Consequences

✅ Stays within the Zoho ecosystem already in use
✅ API key never exposed to the browser
✅ Free trial: 10,000 emails (years of runway for a contact form)
✅ Reply-To set to visitor's email — one-click reply in Zoho Mail
⚠️  Requires ZeptoMail domain DNS verification (SPF + DKIM records in Squarespace)
⚠️  After free trial: ~$3.50/month for 50,000 emails
