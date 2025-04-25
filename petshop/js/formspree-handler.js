// formspree-handler.js - Configuración para formularios de BunnyShop con Formspree

document.addEventListener('DOMContentLoaded', function() {
    // Configurar cada formulario con Formspree
    setupFormspree('.contacto-form', 'meogoono', 'contacto.html');
    setupFormspree('.sugerencias-form', 'mgvkvvda', 'sugerencias.html');
    setupFormspree('.reclamaciones-form', 'mkgrggyb', 'libro-reclamaciones.html');
    
    /**
     * Configura un formulario para usar Formspree
     * @param {string} formSelector - Selector CSS del formulario
     * @param {string} endpoint - ID de Formspree (ejemplo: xrgklpzy)
     * @param {string} redirectPage - Página para redirigir después del envío
     */
    function setupFormspree(formSelector, endpoint, redirectPage) {
        const form = document.querySelector(formSelector);
        if (!form) return; // Si no existe el formulario en esta página, salir
        
        // Configurar action y method
        form.action = `https://formspree.io/f/${endpoint}`;
        form.method = 'POST';
        
        // Agregar campo oculto para redirección
        const redirectInput = document.createElement('input');
        redirectInput.type = 'hidden';
        redirectInput.name = '_next';
        redirectInput.value = window.location.origin + '/' + redirectPage + '?submitted=true';
        form.appendChild(redirectInput);
        
        // Evitar spam con honeypot
        const honeypotInput = document.createElement('input');
        honeypotInput.type = 'text';
        honeypotInput.name = '_gotcha';
        honeypotInput.style.display = 'none';
        form.appendChild(honeypotInput);
        
        // Validación del lado del cliente
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
                return false;
            }
            
            // Mostrar indicador de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            // Por si falla, reactivar después de 10 segundos
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 10000);
        });
    }
    
    /**
     * Valida un formulario
     * @param {HTMLFormElement} form - El formulario a validar
     * @returns {boolean} - True si el formulario es válido
     */
    function validateForm(form) {
        let isValid = true;
        let firstInvalidField = null;
        
        // Resetear estado de validación
        form.querySelectorAll('.invalid').forEach(field => {
            field.classList.remove('invalid');
        });
        
        // Validar campos requeridos
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('invalid');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = field;
            }
        });
        
        // Validar email
        const emailField = form.querySelector('input[type="email"]');
        if (emailField && emailField.value.trim()) {
            if (!isValidEmail(emailField.value)) {
                emailField.classList.add('invalid');
                isValid = false;
                if (!firstInvalidField) firstInvalidField = emailField;
            }
        }
        
        // Validar checkbox de política (solo para contacto)
        const policyCheckbox = form.querySelector('input[name="politica"]');
        if (policyCheckbox && !policyCheckbox.checked) {
            policyCheckbox.parentElement.classList.add('invalid');
            isValid = false;
            if (!firstInvalidField) firstInvalidField = policyCheckbox;
        }
        
        // Enfocar el primer campo inválido
        if (!isValid && firstInvalidField) {
            firstInvalidField.focus();
            showMessage(form, 'Por favor, complete correctamente todos los campos obligatorios.', true);
        }
        
        return isValid;
    }
    
    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} - True si el formato es válido
     */
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Muestra un mensaje al usuario
     * @param {HTMLElement} form - El formulario asociado
     * @param {string} text - Texto del mensaje
     * @param {boolean} isError - Si es un mensaje de error
     */
    function showMessage(form, text, isError = false) {
        // Eliminar mensaje anterior si existe
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Crear mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${isError ? 'error' : 'success'}`;
        messageElement.textContent = text;
        
        // Insertar en DOM
        const container = form.closest('.form-container-full') || 
                         form.closest('.contacto-form-container') ||
                         form.parentElement;
        container.insertBefore(messageElement, form);
        
        // Auto-ocultar
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => messageElement.remove(), 1000);
        }, 5000);
    }
    
    // Verificar si el formulario fue enviado correctamente (por parámetro URL)
    if (window.location.search.includes('submitted=true')) {
        const allForms = document.querySelectorAll('form');
        if (allForms.length > 0) {
            const formContainer = allForms[0].closest('.form-container-full') || 
                              allForms[0].closest('.contacto-form-container') ||
                              allForms[0].parentElement;
                              
            // Crear mensaje de éxito
            const messageElement = document.createElement('div');
            messageElement.className = 'form-message success';
            
            // Personalizar mensaje según la página
            const currentPage = window.location.pathname;
            if (currentPage.includes('contacto')) {
                messageElement.textContent = '¡Gracias por tu mensaje! Te responderemos lo antes posible.';
            } else if (currentPage.includes('sugerencias')) {
                messageElement.textContent = '¡Gracias por tu sugerencia! La tendremos en cuenta para mejorar.';
            } else if (currentPage.includes('libro-reclamaciones')) {
                messageElement.textContent = '¡Tu reclamación ha sido registrada! Nos pondremos en contacto contigo pronto.';
            } else {
                messageElement.textContent = '¡Formulario enviado con éxito!';
            }
            
            // Insertar en DOM
            formContainer.insertBefore(messageElement, allForms[0]);
            
            // Limpiar URL
            if (history.replaceState) {
                history.replaceState(null, document.title, window.location.pathname);
            }
        }
    }
});