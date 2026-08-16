import { submitQuote, uploadQuoteAttachment } from './supabase.js';

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
    const formData = new FormData(form);
    const files = [...(form.querySelector('[name="attachments"]')?.files || [])];
    if(files.length > 5 || files.some(file => file.size > 10 * 1024 * 1024)){
      status.className = 'form-status is-error';
      status.textContent = 'Please attach no more than 5 files, with each file under 10 MB.';
      lastSubmit = 0;
      return;
    }
    const values = Object.fromEntries(formData.entries());
    delete values.attachments;
    delete values.company_website;
    delete values._subject;
    delete values._next;
    try{
      values.area = values.area ? Number(values.area) : null;
      values.attachment_paths = await Promise.all(files.map(uploadQuoteAttachment));
      await submitQuote(values);
      form.reset();
      status.className = 'form-status is-success';
      status.innerHTML = '<span class="success-check" aria-hidden="true">✓</span><span class="success-copy"><b>Quote request received!</b><small>We will contact you within 24 hours.</small></span>';
    }catch(error){
      status.className = 'form-status is-error';
      status.textContent = /bucket not found/i.test(error.message || '')
        ? 'Attachment storage is not set up yet. Run supabase/migrations/003_quote_status_repair.sql, then try again.'
        : (error.message || 'Unable to send your request. Please try again.');
      lastSubmit = 0;
    }
  });
}
