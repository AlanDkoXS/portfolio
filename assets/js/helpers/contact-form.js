// Contact form submission: honeypot, EmailJS and the result dialog.
// The field rules live in form-validation.js; every text comes from
// translations.js in the page language (contactForm.*).
/* global emailjs */
import { loadEmailJS } from './email-js.js';
import { FORM_FIELDS, addFieldValidationListeners, validateForm } from './form-validation.js';
import { t } from './language-switcher.js';

const EMAILJS_SERVICE = 'service_hokfs29';
const EMAILJS_TEMPLATE = 'template_bzic089';

const formDOM = document.querySelector('#form');
const modalDOM = document.querySelector('#modal');

// Result dialog. showModal(): real modal (top layer, trapped focus, native
// Esc). The Close button has autofocus.
function showResult(message) {
  modalDOM.querySelector('p').textContent = message;
  if (!modalDOM.open) modalDOM.showModal();
}

// Honeypot filled → almost certainly a bot
const isBot = () => Boolean(document.getElementById('website')?.value);

const readFields = () => Object.fromEntries(FORM_FIELDS.map((id) => [id, document.getElementById(id).value]));

// The message grows with the text. With field-sizing: content the CSS does
// it; without support (Firefox, old Safari) the height is adjusted on input.
// The cap (max-block-size) stays in the CSS and it scrolls from there on.
function autoGrowMessage() {
  const textarea = document.getElementById('message');
  if (!textarea || CSS.supports('field-sizing', 'content')) return;

  const fit = () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  textarea.addEventListener('input', fit);
  formDOM.addEventListener('reset', () => requestAnimationFrame(fit));
}

async function submitForm(e) {
  e.preventDefault();

  const submitButton = formDOM.querySelector('button[type="submit"]');

  // Pretend it worked, send nothing
  if (isBot()) {
    showResult(t('contactForm.formSuccess'));
    formDOM.reset();
    return;
  }

  const params = readFields();
  if (!validateForm(params).isValid) return;

  try {
    submitButton.disabled = true;
    submitButton.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> ${t('contactForm.sending')}`;

    // Normally it was already downloaded when a field got focus; if not, wait here.
    // If the CDN fails, it falls to the catch and the error message is shown.
    await loadEmailJS();
    await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, params);

    showResult(t('contactForm.formSuccess'));
    formDOM.reset();
  } catch (error) {
    console.error('Error sending email:', error);

    // Any failure (CDN, quota, Gmail account disconnected in EmailJS
    // → 412 "Invalid grant") shows the direct email so the message isn't
    // lost. The technical detail stays in the console.
    if (error?.status) {
      console.error(`EmailJS ${error.status}: ${error.text}`);
    }
    showResult(t('contactForm.formError'));
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `<strong>${t('contactForm.send')}</strong>`;
  }
}

function initContactForm() {
  if (!formDOM) return;

  addFieldValidationListeners();
  autoGrowMessage();

  // EmailJS is downloaded when someone starts using the form, not on page
  // load (so it doesn't compete with the hero or delay the load event)
  const warmUp = () => loadEmailJS().catch(() => {});
  formDOM.addEventListener('focusin', warmUp, { once: true });
  formDOM.addEventListener('pointerdown', warmUp, { once: true });

  formDOM.addEventListener('submit', submitForm);
}

export { initContactForm };
