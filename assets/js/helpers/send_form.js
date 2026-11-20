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
    required: "Fill in this field",
    invalidEmail: "Type a valid email",
    sending: "Sending...",
    success: "Done! I got your message.",
    error: "Your message didn't go through. Try again.",
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
    error: "Tu mensaje no se envió. Inténtalo de nuevo.",
    send: "Envía tu mensaje",
    invalidName: "Escribe tu nombre: de 2 a 50 letras",
    invalidSubject: "Escribe un asunto de 5 a 100 caracteres",
    invalidMessage: "Escribe un mensaje de 10 a 500 caracteres",
    close: "Entendido",
  },
};

// send_form.js
import { loadEmailJS } from "./email-js.js";

const formDOM = document.querySelector("#form");
const modalDOM = document.querySelector("#modal");
let currentLanguage = "en";

function validateField(value, type, language = currentLanguage) {
  const messages = FORM_MESSAGES[language];

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
    // Se anuncia al aparecer y queda ligado al campo para lectores de pantalla
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
  const errors = {};

  ["name", "email", "subject", "message"].forEach((field) => {
    const error = validateField(formData[field], field);
    if (error) {
      isValid = false;
      errors[field] = error;
      showFieldError(field, error);
    } else {
      showFieldError(field, "");
    }
  });

  return { isValid, errors };
}

function openModal() {
  // showModal(): modal real (top layer, foco atrapado, Esc nativo).
  // El botón Cerrar tiene autofocus.
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

function sendEmail() {
  if (!formDOM) return;

  addFieldValidationListeners();

  // EmailJS se descarga cuando alguien empieza a usar el formulario, no al
  // cargar la página (así no compite con el hero ni retrasa el evento load)
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

    const { isValid, errors } = validateForm(params);

    if (!isValid) {
      return;
    }

    try {
      submitButton.disabled = true;
      submitButton.innerHTML = `<i class="bx bx-loader-alt bx-spin"></i> ${FORM_MESSAGES[currentLanguage].sending}`;

      // Normalmente ya se descargó al enfocar un campo; si no, se espera aquí.
      // Si el CDN falla, cae al catch y se muestra el mensaje de error.
      await loadEmailJS();

      // Enviar email con manejo de errores mejorado
      await emailjs.send("service_hokfs29", "template_bzic089", params);

      modalDOM.querySelector("p").textContent =
        FORM_MESSAGES[currentLanguage].success;
      openModal();
      formDOM.reset();
    } catch (error) {
      console.error("Error sending email:", error);

      // Manejo específico de errores de EmailJS
      let errorMessage = FORM_MESSAGES[currentLanguage].error;

      if (error.status === 400) {
        console.error(
          "EmailJS 400 Error - Check service ID, template ID, and parameters"
        );
        errorMessage =
          "Error de configuración. Por favor contacta al administrador.";
      } else if (error.status === 401) {
        console.error("EmailJS 401 Error - Check user ID and permissions");
        errorMessage =
          "Error de autenticación. Por favor contacta al administrador.";
      }

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
