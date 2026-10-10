const form = document.querySelector('.formulario');

if (form) {
    const submitButton = form.querySelector('.boton-envio');
    const buttonText = submitButton.querySelector('.boton-envio__texto');
    const statusMessage = form.querySelector('.estado-envio');

    form.querySelectorAll('select').forEach((select, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'desplegable';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'form-select desplegable__boton';
        trigger.id = `${select.id || `desplegable-${index + 1}`}-control`;
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const label = form.querySelector(`label[for="${select.id}"]`);
        if (label) {
            trigger.setAttribute('aria-labelledby', label.id || (label.id = `${trigger.id}-label`));
            label.htmlFor = trigger.id;
        }

        const menu = document.createElement('div');
        menu.className = 'desplegable__opciones';
        menu.id = `${trigger.id}-opciones`;
        menu.hidden = true;
        menu.setAttribute('role', 'listbox');
        menu.setAttribute('aria-label', label?.textContent.trim() || 'Opciones');
        trigger.setAttribute('aria-controls', menu.id);

        const optionButtons = [];
        Array.from(select.options).forEach((option) => {
            if (option.hidden && option.value === '') {
                return;
            }

            const optionButton = document.createElement('button');
            optionButton.type = 'button';
            optionButton.className = 'desplegable__opcion';
            optionButton.textContent = option.textContent;
            optionButton.setAttribute('role', 'option');
            optionButton.setAttribute('aria-selected', String(option.selected));
            optionButton.disabled = option.disabled;
            optionButton.addEventListener('click', () => {
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                trigger.textContent = option.textContent;
                menu.querySelectorAll('[role="option"]').forEach((item) => {
                    item.setAttribute('aria-selected', String(item === optionButton));
                });
                closeMenu();
                trigger.focus();
            });
            menu.append(optionButton);
            optionButtons.push(optionButton);
        });

        const selectedOption = select.selectedOptions[0];
        trigger.textContent = selectedOption?.textContent || 'Seleccione una opción';

        function closeMenu() {
            wrapper.classList.remove('desplegable--abierto');
            trigger.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
        }

        function openMenu() {
            menu.hidden = false;
            wrapper.classList.add('desplegable--abierto');
            trigger.setAttribute('aria-expanded', 'true');
            const currentIndex = optionButtons.findIndex((option) => option.getAttribute('aria-selected') === 'true');
            optionButtons[currentIndex >= 0 ? currentIndex : 0]?.focus();
        }

        trigger.addEventListener('click', () => {
            if (trigger.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            } else {
                openMenu();
            }
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openMenu();
            }
        });

        menu.addEventListener('keydown', (event) => {
            const currentIndex = optionButtons.indexOf(document.activeElement);
            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu();
                trigger.focus();
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                const nextIndex = (currentIndex + direction + optionButtons.length) % optionButtons.length;
                optionButtons[nextIndex].focus();
            }
        });

        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');
        select.classList.add('desplegable__select-nativo');
        select.before(wrapper);
        wrapper.append(trigger, menu, select);
    });

    document.addEventListener('click', (event) => {
        form.querySelectorAll('.desplegable--abierto').forEach((wrapper) => {
            if (!wrapper.contains(event.target)) {
                wrapper.querySelector('.desplegable__boton').click();
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        submitButton.disabled = true;
        submitButton.classList.remove('enviado');
        buttonText.textContent = 'Enviando...';
        statusMessage.textContent = '';
        statusMessage.classList.remove('estado-envio--error');

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: new FormData(form),
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!response.ok) {
                throw new Error('El servidor no pudo procesar el formulario.');
            }

            buttonText.textContent = 'Enviado';
            submitButton.classList.add('enviado');
            statusMessage.textContent = '¡Tu inscripción se envió correctamente!';
        } catch (error) {
            buttonText.textContent = 'Enviar';
            submitButton.disabled = false;
            statusMessage.textContent = 'No se pudo enviar el formulario. Inténtalo de nuevo.';
            statusMessage.classList.add('estado-envio--error');
        }
    });
}