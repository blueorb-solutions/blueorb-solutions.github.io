// Cloudflare Worker — BlueOrb Contact Form
// Receives POST from the site, sends email via ZeptoMail REST API.
//
// Secrets  (set via: wrangler secret put ZEPTO_API_KEY)
//   ZEPTO_API_KEY — ZeptoMail API key, never stored in any file
//
// Vars (set in wrangler.toml [vars] — safe to commit)
//   FROM_EMAIL, FROM_NAME, TO_EMAIL, ALLOWED_ORIGIN

export default {
  async fetch(request, env) {
    // Allow production origin and localhost for local testing
    const requestOrigin = request.headers.get('Origin') ?? '';
    const allowed = [env.ALLOWED_ORIGIN, env.ALLOWED_ORIGIN_LOCAL];
    const origin = allowed.includes(requestOrigin) ? requestOrigin : env.ALLOWED_ORIGIN;
    const reply = (body, status) => cors(body, status, origin);

    if (request.method === 'OPTIONS') {
      return reply(null, 204);
    }

    if (request.method !== 'POST') {
      return reply('Method not allowed', 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return reply(JSON.stringify({ error: 'Invalid JSON' }), 400);
    }

    const { name, email, subject, message } = body;
    if (!name || !email || !subject || !message) {
      return reply(JSON.stringify({ error: 'Missing required fields' }), 400);
    }

    const res = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': env.ZEPTO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { address: env.FROM_EMAIL, name: env.FROM_NAME },
        to: [{ email_address: { address: env.TO_EMAIL } }],
        reply_to: [{ address: email, name }],
        subject: `[Contact] ${subject}`,
        textbody: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    const data = await res.json();
    return reply(JSON.stringify(data), res.ok ? 200 : 500);
  },
};

function cors(body, status, origin) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin ?? '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': body ? 'application/json' : '',
    },
  });
}
