// Contact form validation: the rules of each field, the message a wrong
// value gets (translations.js → validation.*) and how it's shown under the field.
import { t } from './language-switcher.js';

export const FORM_FIELDS = ['name', 'email', 'subject', 'message'];

// A value must match `pattern` and have between minLength and maxLength
// characters (whichever the field declares); otherwise it gets `message`
const VALIDATION_RULES = {
  name: {
    pattern: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
    minLength: 2,
    maxLength: 50,
    message: 'validation.invalidName',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'validation.invalidEmail',
  },
  subject: {
    minLength: 5,
    maxLength: 100,
    message: 'validation.invalidSubject',
  },
  message: {
    minLength: 10,
    maxLength: 500,
    message: 'validation.invalidMessage',
  },
};

/** Error message for the value in the page language, or '' when it's valid. */
function validateField(value, type) {
  if (!value || !value.trim()) return t('validation.required');

  const rule = VALIDATION_RULES[type];
  if (!rule) return '';

  const { pattern, minLength = 0, maxLength = Infinity, message } = rule;
  if (pattern && !pattern.test(value)) return t(message);
  if (value.length < minLength || value.length > maxLength) return t(message);

  return '';
}

/** Shows (or clears, with '') the error under the field. */
function showFieldError(fieldId, error) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  let errorDiv = field.nextElementSibling;
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.id = `${fieldId}-error`;
    // Announced when it appears and tied to the field for screen readers
    errorDiv.setAttribute('aria-live', 'polite');
    field.setAttribute('aria-describedby', errorDiv.id);
    field.after(errorDiv);
  }

  errorDiv.textContent = error;
  field.classList.toggle('invalid', Boolean(error));
  field.setAttribute('aria-invalid', error ? 'true' : 'false');
}

/** Validates every field and shows its result; isValid when none failed. */
export function validateForm(formData) {
  let isValid = true;

  FORM_FIELDS.forEach((field) => {
    const error = validateField(formData[field], field);
    if (error) isValid = false;
    showFieldError(field, error);
  });

  return { isValid };
}

/** Each field is validated when it loses focus. */
export function addFieldValidationListeners() {
  FORM_FIELDS.forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field?.addEventListener('blur', () => {
      showFieldError(fieldId, validateField(field.value, fieldId));
    });
  });
}
