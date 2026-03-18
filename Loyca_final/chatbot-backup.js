(function initLoycaFaqChatbot() {
    const root = document.getElementById('loycaChatbot');
    if (!root) return;

    const fab = document.getElementById('chatbotFab');
    const win = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const quick = document.getElementById('chatbotQuick');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotText');

    if (fab) {
        const icon = fab.querySelector('.chatbot-fab__icon');
        if (icon) icon.textContent = '🤖';
    }

    const WHATSAPP = 'https://wa.me/5493413138290';
    const STORAGE_KEY = 'loyca_chat_history_v1';

    const isInFrontend = /\/frontend\//i.test(window.location.pathname.replace(/\\/g, '/'));
    const prefix = isInFrontend ? '../' : '';

    const LINKS = {
        publicidad: `${prefix}frontend/publicidad-redes.html#socialMediaForm`,
        datos: `${prefix}frontend/ciencia-datos.html#kpiContactForm`,
        web: `${prefix}frontend/ciencia-datos.html#webDevForm`
    };

    function setupScrollTellingUI() {
        if (!win || !messages) return;

        if (!win.querySelector('.chatbot-progress')) {
            const progress = document.createElement('div');
            progress.className = 'chatbot-progress';
            progress.setAttribute('aria-hidden', 'true');

            const bar = document.createElement('div');
            bar.className = 'chatbot-progress__bar';
            progress.appendChild(bar);

            const header = win.querySelector('.chatbot-header');
            if (header && header.parentNode) {
                header.parentNode.insertBefore(progress, header.nextSibling);
            } else {
                win.insertBefore(progress, win.firstChild);
            }
        }

        const update = () => {
            const progressEl = win.querySelector('.chatbot-progress__bar');
            if (progressEl) {
                const max = Math.max(1, messages.scrollHeight - messages.clientHeight);
                const p = Math.min(1, Math.max(0, messages.scrollTop / max));
                progressEl.style.transform = `scaleX(${p})`;
            }

            const atTop = messages.scrollTop <= 2;
            const atBottom = (messages.scrollTop + messages.clientHeight) >= (messages.scrollHeight - 2);

            messages.classList.toggle('has-top-shadow', !atTop);
            messages.classList.toggle('has-bottom-shadow', !atBottom);
        };

        messages.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    function pushStorySteps() {
        // Eliminado - ahora el chat es conversacional puro tipo WhatsApp
    }

    function openChat() {
        root.classList.add('is-open');
        if (input) input.focus();
        try {
            localStorage.setItem('loyca_chat_open', '1');
        } catch (e) {
        }
    }

    function closeChat() {
        root.classList.remove('is-open');
        try {
            localStorage.setItem('loyca_chat_open', '0');
        } catch (e) {
        }
    }

    function loadHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory(history) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
        }
    }

    let history = loadHistory();

    function renderHistory() {
        if (!messages) return;
        messages.innerHTML = '';
        history.forEach((item) => {
            if (!item || typeof item.text !== 'string' || (item.who !== 'bot' && item.who !== 'user')) return;
            const div = document.createElement('div');
            div.className = `chatbot-msg ${item.who}`;
            div.textContent = item.text;
            messages.appendChild(div);
        });
        messages.scrollTop = messages.scrollHeight;
    }

    function pushMsg(text, who) {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = `chatbot-msg ${who} is-new`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;

        setTimeout(() => {
            div.classList.remove('is-new');
        }, 300);

        history.push({ who, text, ts: Date.now() });
        if (history.length > 120) {
            history = history.slice(history.length - 120);
        }
        saveHistory(history);
    }

    let typingTimeout = null;

    function showTyping() {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = 'chatbot-msg bot is-typing';
        div.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>Escribiendo…';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }

    function hideTyping(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    function pushBot(text, delay = 400) {
        return new Promise((resolve) => {
            const typingEl = showTyping();
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                hideTyping(typingEl);
                pushMsg(text, 'bot');
                resolve();
            }, delay);
        });
    }

    function pushUser(text) {
        pushMsg(text, 'user');
    }

    function setQuickButtons(items) {
        if (!quick) return;
        quick.innerHTML = '';
        items.forEach((item) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chatbot-chip';
            btn.textContent = item.label;
            btn.addEventListener('click', item.onClick);
            quick.appendChild(btn);
        });
    }

    function go(href) {
        window.location.href = href;
    }

    function openWhatsApp(reason) {
        if (reason === 'contacto') {
            pushBot('Te estoy derivando a WhatsApp para que hables con una persona de nuestro equipo. Si no se abre automáticamente, podés hacer clic en el botón de nuevo o copiar el número.');
        } else if (reason === 'tiempos') {
            pushBot('Para darte una mejor respuesta sobre tiempos y resultados, te paso a WhatsApp para que podamos ver los detalles de tu proyecto.');
        } else {
            pushBot('Te paso a WhatsApp para que hables con una persona de nuestro equipo.');
        }

        window.open(WHATSAPP, '_blank');
    }

    function showMainMenu() {
        setQuickButtons([
            { label: 'Servicios que ofrecen', onClick: () => handleIntent('servicios') },
            { label: 'Rubros con los que trabajan', onClick: () => handleIntent('rubros') },
            { label: 'Precios de presupuestos', onClick: () => handleIntent('precios') },
            { label: 'Quiero hablar con una persona', onClick: () => handleIntent('contacto') }
        ]);
    }

    function handleIntent(intent) {
        if (intent === 'servicios') {
            pushBot('Te cuento nuestros servicios principales: Publicidad y Marketing, Desarrollo Web y Ciencia de Datos. ¿Cuál te gustaría conocer?').then(() => {
                setQuickButtons([
                    { label: 'Publicidad y Marketing', onClick: () => go(LINKS.publicidad) },
                    { label: 'Desarrollo Web', onClick: () => go(LINKS.web) },
                    { label: 'Ciencia de Datos', onClick: () => go(LINKS.datos) },
                    { label: 'Rubros', onClick: () => handleIntent('rubros') },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') }
                ]);
            });
            return;
        }

        if (intent === 'rubros') {
            pushBot('Trabajamos con marcas y negocios que quieren crecer con estrategia y datos. Algunos rubros con los que tenemos experiencia: Salud (clínicas, odontología, estética), Gastronomía, Retail y e-commerce, Servicios profesionales, Inmobiliarias, Educación, Turismo y hotelería, Fitness y bienestar. ¿De qué rubro es tu negocio?').then(() => {
                setQuickButtons([
                    { label: 'Salud / Estética', onClick: () => pushBot('Entendido. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.') },
                    { label: 'Gastronomía', onClick: () => pushBot('Perfecto. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.') },
                    { label: 'Tienda / E-commerce', onClick: () => pushBot('Excelente. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.') },
                    { label: 'Servicios Profesionales', onClick: () => pushBot('Muy bien. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.') },
                    { label: 'Otro rubro', onClick: () => { if (input) input.focus(); } },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') }
                ]);
            });
            return;
        }

        if (intent === 'precios') {
            pushBot('El precio depende de lo que necesites y del alcance del proyecto. Para poder cotizarte correctamente, primero completá el formulario del servicio que te interesa y con esa información te enviamos el presupuesto.').then(() => {
                setQuickButtons([
                    { label: 'Formulario Publicidad y Marketing', onClick: () => go(LINKS.publicidad) },
                    { label: 'Formulario Ciencia de Datos', onClick: () => go(LINKS.datos) },
                    { label: 'Formulario Desarrollo Web', onClick: () => go(LINKS.web) },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: 'Volver', onClick: () => { pushBot('¿Qué más necesitás?').then(() => showMainMenu()); } }
                ]);
            });
            return;
        }

        if (intent === 'proceso') {
            pushBot('Nuestro proceso de trabajo es simple: 1) Completás el formulario del servicio que te interesa 2) Revisamos la información y definimos objetivos juntos 3) Te enviamos una propuesta y presupuesto 4) Si avanzamos, planificamos y ejecutamos con seguimiento y mejoras constantes.').then(() => {
                setQuickButtons([
                    { label: 'Servicios', onClick: () => handleIntent('servicios') },
                    { label: 'Completar formulario', onClick: () => handleIntent('precios') },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: 'Volver', onClick: () => { pushBot('¿Qué más necesitás?').then(() => showMainMenu()); } }
                ]);
            });
            return;
        }

        if (intent === 'tiempos') {
            pushBot('Los tiempos y resultados dependen del proyecto y la urgencia. Para darte una respuesta precisa, ¿te gustaría hablar con una persona por WhatsApp?').then(() => {
                setQuickButtons([
                    { label: 'Hablar por WhatsApp', onClick: () => openWhatsApp('tiempos') },
                    { label: 'Volver', onClick: () => { pushBot('¿Qué más necesitás?').then(() => showMainMenu()); } }
                ]);
            });
            return;
        }

        if (intent === 'contacto') {
            pushBot('Perfecto. Si querés hablar con una persona de nuestro equipo, escribinos por WhatsApp y te respondemos a la brevedad.').then(() => {
                setQuickButtons([
                    { label: 'Abrir WhatsApp', onClick: () => openWhatsApp('contacto') },
                    { label: 'Volver', onClick: () => { pushBot('¿Qué más necesitás?').then(() => showMainMenu()); } }
                ]);
            });
            return;
        }

        pushBot('Podés elegir una opción del menú o escribirme tu consulta.').then(() => {
            showMainMenu();
        });
    }

    function normalize(s) {
        return (s || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function routeText(text) {
        const t = normalize(text);
        if (!t) return;

        if (t.includes('precio') || t.includes('costo') || t.includes('presupuesto') || t.includes('tarifa')) {
            handleIntent('precios');
            return;
        }

        if (t.includes('rubro') || t.includes('industria') || t.includes('sector') || t.includes('nicho')) {
            handleIntent('rubros');
            return;
        }

        if (t.includes('proceso') || t.includes('como trabajan') || t.includes('como es') || t.includes('pasos')) {
            handleIntent('proceso');
            return;
        }

        if (t.includes('tiempo') || t.includes('tarda') || t.includes('urgencia') || t.includes('resultado') || t.includes('plazo') || t.includes('entrega')) {
            handleIntent('tiempos');
            return;
        }

        if (t.includes('contacto') || t.includes('whatsapp') || t.includes('hablar') || t.includes('persona') || t.includes('telefono')) {
            handleIntent('contacto');
            return;
        }

        if (t.includes('serv') || t.includes('marketing') || t.includes('publicidad') || t.includes('redes') || t.includes('web') || t.includes('pagina') || t.includes('datos') || t.includes('dashboard')) {
            handleIntent('servicios');
            return;
        }

        pushBot('Para ayudarte mejor, elegí una opción del menú o contame más sobre lo que necesitás.').then(() => {
            showMainMenu();
        });
    }

    if (fab) {
        fab.addEventListener('click', () => {
            const isOpen = root.classList.contains('is-open');
            if (isOpen) {
                closeChat();
            } else {
                openChat();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeChat);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input && input.value ? input.value.trim() : '';
            if (!text) return;
            pushUser(text);
            if (input) input.value = '';
            setTimeout(() => routeText(text), 150);
        });
    }

    if (history.length > 0) {
        renderHistory();
        setupScrollTellingUI();
        showMainMenu();
    } else {
        pushBot('¡Hola! Soy Loyca. ¿En qué te puedo ayudar?').then(() => {
            showMainMenu();
        });
        setupScrollTellingUI();
        showMainMenu();
    }

    try {
        if (localStorage.getItem('loyca_chat_open') === '1') {
            openChat();
        }
    } catch (e) {
    }
})();
