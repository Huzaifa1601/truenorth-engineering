import { submitQuote } from './supabase.js';

export function initContactForm(){
  const form = document.querySelector('form.quote');
  if(!form) return;
  const status = form.querySelector('.form-status');
  let lastSubmit = 0;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const now = Date.now();
    if(now - lastSubmit < 8000){ status.textContent = 'Please wait a few seconds before sending again.'; return; }
    if(form.querySelector('[name="company_website"]')?.value){ status.textContent = 'Submission blocked.'; return; }
    lastSubmit = now;
    status.className = 'form-status is-loading';
    status.textContent = 'Sending your request...';
    const values = Object.fromEntries(new FormData(form).entries());
    delete values.company_website;
    delete values._subject;
    delete values._next;
    try{
      await submitQuote(values);
      form.reset();
      status.className = 'form-status is-success';
      status.innerHTML = '<span class="success-check" aria-hidden="true">✓</span><span class="success-copy"><b>Quote request received!</b><small>We will contact you within 24 hours.</small></span>';
    }catch(error){
      status.className = 'form-status is-error';
      status.textContent = error.message || 'Unable to send your request. Please try again.';
      lastSubmit = 0;
    }
  });
}
