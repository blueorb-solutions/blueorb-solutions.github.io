// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.background = window.scrollY > 40
    ? 'rgba(10, 22, 40, 0.98)'
    : 'rgba(10, 22, 40, 0.92)';
});

// Smooth active link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--accent)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// Contact form — submits silently via Cloudflare Worker → ZeptoMail → inbox
const WORKER_URL = 'https://blueorb-contact-worker.REPLACE_WITH_YOUR_CF_SUBDOMAIN.workers.dev';

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f   = e.target;
  const btn = document.getElementById('submit-btn');
  const msg = document.getElementById('form-msg');

  const name    = f.querySelector('[name="name"]').value.trim();
  const email   = f.querySelector('[name="email"]').value.trim();
  const subject = f.querySelector('[name="subject"]').value.trim();
  const message = f.querySelector('[name="message"]').value.trim();

  btn.disabled    = true;
  btn.textContent = 'Sending…';
  msg.textContent = '';

  try {
    const res = await fetch(WORKER_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, subject, message }),
    });

    if (res.ok) {
      msg.style.color = 'var(--accent)';
      msg.textContent = "Message sent! We'll be in touch soon.";
      f.reset();
    } else {
      msg.style.color = '#ff6b6b';
      msg.textContent = 'Something went wrong. Please try again.';
    }
  } catch {
    msg.style.color = '#ff6b6b';
    msg.textContent = 'Network error. Please check your connection and try again.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Send Message';
  }
});
