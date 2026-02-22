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

// Contact form — opens visitor's email client addressed to info@blueorb-solutions.com
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const name    = f.querySelector('[name="name"]').value.trim();
  const email   = f.querySelector('[name="email"]').value.trim();
  const subject = f.querySelector('[name="subject"]').value.trim();
  const message = f.querySelector('[name="message"]').value.trim();

  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  window.location.href =
    `mailto:info@blueorb-solutions.com` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`;

  const msg = document.getElementById('form-msg');
  msg.textContent = 'Opening your email client…';
  f.reset();
  setTimeout(() => { msg.textContent = ''; }, 5000);
});
