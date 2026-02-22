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

// Contact form — submits to Formspree and emails info@blueorb-solutions.com
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const formMsg     = document.getElementById('form-msg');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formId = contactForm.querySelector('[name="_formspree_id"]').value;

  if (formId === 'YOUR_FORM_ID') {
    formMsg.style.color = '#ff6b6b';
    formMsg.textContent = 'Form not configured yet. Please add your Formspree form ID.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  formMsg.style.color = 'var(--accent)';
  formMsg.textContent = '';

  try {
    const data = new FormData(contactForm);
    const res  = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      formMsg.textContent = "Thanks! We'll be in touch within one business day.";
      contactForm.reset();
    } else {
      const json = await res.json();
      formMsg.style.color = '#ff6b6b';
      formMsg.textContent = json.error || 'Something went wrong. Please try again.';
    }
  } catch {
    formMsg.style.color = '#ff6b6b';
    formMsg.textContent = 'Network error. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    setTimeout(() => { formMsg.textContent = ''; formMsg.style.color = 'var(--accent)'; }, 6000);
  }
});
