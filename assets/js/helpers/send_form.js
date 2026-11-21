import { loadEmailJS } from "./email-js.js";

const VALIDATION_RULES = {
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

const FORM_MESSAGES = {
  en: {
    required: "Fill in this field",
    invalidEmail: "Type a valid email",
    sending: "Sending...",
    success: "Done! I got your message.",
    error: "Your message didn't go through. Write to me at hello@alanquintana.pro",
    send: "Send your message",
    invalidName: "Type your name: 2 to 50 letters",
    invalidSubject: "Write a subject of 5 to 100 characters",
    invalidMessage: "Write a message of 10 to 500 characters",
    close: "Got it",
  },
  es: {
    required: "Llena este campo",
    invalidEmail: "Escribe un correo válido",
    sending: "Enviando...",
    success: "¡Listo! Recibí tu mensaje.",
    error: "Tu mensaje no se envió. Escríbeme a hola@alanquintana.pro",
    send: "Envía tu mensaje",
    invalidName: "Escribe tu nombre: de 2 a 50 letras",
    invalidSubject: "Escribe un asunto de 5 a 100 caracteres",
    invalidMessage: "Escribe un mensaje de 10 a 500 caracteres",
    close: "Entendido",
  },
};

const formDOM = document.querySelector("#form");
const modalDOM = document.querySelector("#modal");
// Page language (/ or /es/); languageChange keeps it up to date
let currentLanguage = document.documentElement.lang === "es" ? "es" : "en";

function validateField(value, type) {
  const messages = FORM_MESSAGES[currentLanguage];

  if (!value || !value.trim()) {
    return messages.required;
  }

  switch (type) {
    case "name":
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

    case "email":
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return messages.invalidEmail;
      }
      break;

    case "subject":
      if (
        value.length < VALIDATION_RULES.subject.minLength ||
        value.length > VALIDATION_RULES.subject.maxLength
      ) {
        return messages.invalidSubject;
      }
      break;

    case "message":
      if (
        value.length < VALIDATION_RULES.message.minLength ||
        value.length > VALIDATION_RULES.message.maxLength
      ) {
        return messages.invalidMessage;
      }
      break;
  }

  return "";
}

function showFieldError(fieldId, error) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const errorDiv = field.nextElementSibling || document.createElement("div");

  if (!field.nextElementSibling) {
    errorDiv.className = "field-error";
    errorDiv.id = `${fieldId}-error`;
    // Announced when it appears and tied to the field for screen readers
    errorDiv.setAttribute("aria-live", "polite");
    field.setAttribute("aria-describedby", errorDiv.id);
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
  }

  errorDiv.textContent = error;
  field.classList.toggle("invalid", Boolean(error));
  field.setAttribute("aria-invalid", error ? "true" : "false");
}

function validateForm(formData) {
  let isValid = true;

  ["name", "email", "subject", "message"].forEach((field) => {
    const error = validateField(formData[field], field);
    if (error) {
      isValid = false;
      showFieldError(field, error);
    } else {
      showFieldError(field, "");
    }
  });

  return { isValid };
}

function openModal() {
  // showModal(): real modal (top layer, trapped focus, native Esc).
  // The Close button has autofocus.
  if (modalDOM && !modalDOM.open) modalDOM.showModal();
}

function addFieldValidationListeners() {
  ["name", "email", "subject", "message"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener("blur", () => {
        const error = validateField(field.value, fieldId);
        showFieldError(fieldId, error);
      });
    }
  });
}

// The message grows with the text. With field-sizing: content the CSS does
// it; without support (Firefox, old Safari) the height is adjusted on input.
// The cap (max-block-size) stays in the CSS and it scrolls from there on.
function autoGrowMessage() {
  const textarea = document.getElementById("message");
  if (!textarea || CSS.supports("field-sizing", "content")) return;

  const fit = () => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  textarea.addEventListener("input", fit);
  formDOM.addEventListener("reset", () => requestAnimationFrame(fit));
}

function sendEmail() {
  if (!formDOM) return;

  addFieldValidationListeners();
  autoGrowMessage();

  // EmailJS is downloaded when someone starts using the form, not on page
  // load (so it doesn't compete with the hero or delay the load event)
  const warmUp = () => loadEmailJS().catch(() => {});
  formDOM.addEventListener("focusin", warmUp, { once: true });
  formDOM.addEventListener("pointerdown", warmUp, { once: true });

  formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = formDOM.querySelector('button[type="submit"]');

    // Honeypot filled → almost certainly a bot. Pretend it worked, send nothing.
    if (document.getElementById("website")?.value) {
      modalDOM.querySelector("p").textContent =
        FORM_MESSAGES[currentLanguage].success;
      openModal();
      formDOM.reset();
      return;
    }

    const params = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      subject: document.getElementById("subject").value,
      message: document.getElementById("message").value,
    };

    const { isValid } = validateForm(params);

    if (!isValid) {
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> ${FORM_MESSAGES[currentLanguage].sending}`;

      // Normally it was already downloaded when a field got focus; if not, wait here.
      // If the CDN fails, it falls to the catch and the error message is shown.
      await loadEmailJS();

      // Send the email with improved error handling
      await emailjs.send("service_hokfs29", "template_bzic089", params);

      modalDOM.querySelector("p").textContent =
        FORM_MESSAGES[currentLanguage].success;
      openModal();
      formDOM.reset();
    } catch (error) {
      console.error("Error sending email:", error);

      // Any failure (CDN, quota, Gmail account disconnected in EmailJS
      // → 412 "Invalid grant") shows the direct email so the message isn't
      // lost. The technical detail stays in the console.
      if (error?.status) {
        console.error(`EmailJS ${error.status}: ${error.text}`);
      }
      const errorMessage = FORM_MESSAGES[currentLanguage].error;

      modalDOM.querySelector("p").textContent = errorMessage;
      openModal();
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = `<strong>${FORM_MESSAGES[currentLanguage].send}</strong>`;
    }
  });
}

// Listen for language changes
window.addEventListener("languageChange", (e) => {
  currentLanguage = e.detail.language || "en";
});

export default sendEmail;
