const form = document.getElementById('contactForm');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.contact-form-status');
  button.disabled = true;
  status.textContent = 'Sending your enquiry…';

  try {
    const response = await fetch('/api/resend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
    });

    if (!response.ok) throw new Error(`Contact request failed: ${response.status}`);
    status.textContent = 'Thank you for your enquiry. I’ll be in touch soon.';
    form.reset();
  } catch (error) {
    console.error('Unable to send contact form:', error);
    status.textContent = 'Your enquiry could not be sent. Please try again or email lljustinlu@gmail.com.';
  } finally {
    button.disabled = false;
  }
});
