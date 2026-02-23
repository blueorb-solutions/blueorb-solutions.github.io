// Cloudflare Worker — BlueOrb Contact Form
// Receives POST from the site, sends email via ZeptoMail REST API.
// ZEPTO_API_KEY is stored as a Cloudflare secret (never exposed to browser).

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return cors(null, 204);
    }

    if (request.method !== 'POST') {
      return cors('Method not allowed', 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(JSON.stringify({ error: 'Invalid JSON' }), 400);
    }

    const { name, email, subject, message } = body;
    if (!name || !email || !subject || !message) {
      return cors(JSON.stringify({ error: 'Missing required fields' }), 400);
    }

    const res = await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': env.ZEPTO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          address: 'noreply@blueorb-solutions.com',
          name: 'BlueOrb Contact Form',
        },
        to: [{ email_address: { address: 'info@blueorb-solutions.com' } }],
        reply_to: [{ address: email, name }],
        subject: `[Contact] ${subject}`,
        textbody: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      }),
    });

    const data = await res.json();
    return cors(JSON.stringify(data), res.ok ? 200 : 500);
  },
};

function cors(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': 'https://www.blueorb-solutions.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': body ? 'application/json' : '',
    },
  });
}
