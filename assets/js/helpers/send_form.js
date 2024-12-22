// form_validation.js
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
  },
  subject: {
    minLength: 5,
    maxLength: 100,
  },
  message: {
    minLength: 10,
    maxLength: 500,
  },
};

export const FORM_MESSAGES = {
  en: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    sending: 'Sending...',
    success: 'Message sent successfully!',
    error: 'Error sending message. Please try again.',
    send: 'Send',
    invalidName: 'Name must be between 2 and 50 characters and contain only letters',
    invalidSubject: 'Subject must be between 5 and 100 characters',
    invalidMessage: 'Message must be between 10 and 500 characters',
    close: 'Close',
  },
  es: {
    required: 'Este campo es requerido',
    invalidEmail: 'Por favor ingresa un email válido',
    sending: 'Enviando...',
    success: '¡Mensaje enviado correctamente!',
    error: 'Error al enviar el mensaje. Por favor intenta nuevamente.',
    send: 'Enviar',
    invalidName: 'El nombre debe tener entre 2 y 50 caracteres y contener solo letras',
    invalidSubject: 'El asunto debe tener entre 5 y 100 caracteres',
    invalidMessage: 'El mensaje debe tener entre 10 y 500 caracteres',
    close: 'Cerrar',
  },
};

// send_form.js
const formDOM = document.querySelector('#form');
const modalDOM = document.querySelector('#modal');
const closeButton = document.querySelector('#btn_close-modal');
let currentLanguage = 'en';

function validateField(value, type, language = currentLanguage) {
  const messages = FORM_MESSAGES[language];

  if (!value || !value.trim()) {
    return messages.required;
  }

  switch (type) {
    case 'name':
      if (!VALIDATION_RULES.name.pattern.test(value)) {
        return messages.invalidName;
      }
      if (
        value.length < VALIDATION_RULES.name.minLength ||
        value.length > VALIDATION_RULES.name.maxLength
      ) {
        return messages.invalidName;
      }
      break;

    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return messages.invalidEmail;
      }
      break;

    case 'subject':
      if (
        value.length < VALIDATION_RULES.subject.minLength ||
        value.length > VALIDATION_RULES.subject.maxLength
      ) {
        return messages.invalidSubject;
      }
      break;

    case 'message':
      if (
        value.length < VALIDATION_RULES.message.minLength ||
        value.length > VALIDATION_RULES.message.maxLength
      ) {
        return messages.invalidMessage;
      }
      break;
  }

  return '';
}

function showFieldError(fieldId, error) {
  const field = document.getElementById(fieldId);
  const errorDiv = field.nextElementSibling || document.createElement('div');

  if (!field.nextElementSibling) {
    errorDiv.className = 'field-error';
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  errorDiv.textContent = error;
  field.classList.toggle('invalid', Boolean(error));
}

function validateForm(formData) {
  let isValid = true;
  const errors = {};

  ['name', 'email', 'subject', 'message'].forEach((field) => {
    const error = validateField(formData[field], field);
    if (error) {
      isValid = false;
      errors[field] = error;
      showFieldError(field, error);
    } else {
      showFieldError(field, '');
    }
  });

  return { isValid, errors };
}

function openModal() {
  modalDOM.setAttribute('open', '');
  modalDOM.querySelector('button').focus();
}

function closeModal() {
  modalDOM.removeAttribute('open');
}

function addFieldValidationListeners() {
  ['name', 'email', 'subject', 'message'].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener('blur', () => {
      const error = validateField(field.value, fieldId);
      showFieldError(fieldId, error);
    });
  });
}

function sendEmail() {
  if (!formDOM) return;

  addFieldValidationListeners();

  formDOM.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = formDOM.querySelector('button[type="submit"]');
    const params = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value,
    };

    const { isValid, errors } = validateForm(params);

    if (!isValid) {
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> ${FORM_MESSAGES[currentLanguage].sending}`;

      await emailjs.send('service_i78o8xe', 'template_bzic089', params);

      openModal();
      formDOM.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      modalDOM.querySelector('p').textContent = FORM_MESSAGES[currentLanguage].error;
      openModal();
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `<strong>${FORM_MESSAGES[currentLanguage].send}</strong>`;
    }
  });
}

// Event listeners for modal
closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  closeModal();
});

modalDOM.addEventListener('click', (e) => {
  if (e.target === modalDOM) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalDOM.hasAttribute('open')) {
    closeModal();
  }
});

// Listen for language changes
window.addEventListener('languageChange', (e) => {
  currentLanguage = e.detail.language || 'en';
});

export default sendEmail;
