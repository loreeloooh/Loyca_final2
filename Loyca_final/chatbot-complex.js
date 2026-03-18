document.addEventListener('DOMContentLoaded', function() {
(function() {
    const root = document.getElementById('loycaChatbot');
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
            win.insertBefore(progress, messages);
        }

        const updateProgress = () => {
            if (!messages) return;
            const scrollHeight = messages.scrollHeight;
            const scrollTop = messages.scrollTop;
            const clientHeight = messages.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

            const progressBar = win.querySelector('.chatbot-progress__bar');
            if (progressBar) {
                progressBar.style.transform = `scaleX(${progress})`;
            }

            const hasTopShadow = scrollTop > 10;
            const hasBottomShadow = scrollTop < maxScroll - 10;
            messages.classList.toggle('has-top-shadow', hasTopShadow);
            messages.classList.toggle('has-bottom-shadow', hasBottomShadow);
        };

        messages.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    function renderHistory() {
        if (!messages) return;
        messages.innerHTML = '';
        history.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chatbot-msg ${msg.type}`;
            div.textContent = msg.text;
            messages.appendChild(div);
        });
        messages.scrollTop = messages.scrollHeight;
    }

    function pushBot(text) {
        return new Promise(resolve => {
            const typing = document.createElement('div');
            typing.className = 'chatbot-msg bot is-typing';
            typing.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>Escribiendo...';
            if (messages) {
                messages.appendChild(typing);
                messages.scrollTop = messages.scrollHeight;
            }

            setTimeout(() => {
                if (typing.parentNode) typing.remove();
                const div = document.createElement('div');
                div.className = 'chatbot-msg bot is-new';
                div.textContent = text;
                if (messages) {
                    messages.appendChild(div);
                    messages.scrollTop = messages.scrollHeight;
                    setupScrollTellingUI();
                }
                history.push({ type: 'bot', text, time: Date.now() });
                saveHistory();
                resolve();
            }, 800 + Math.random() * 400);
        });
    }

    function pushUser(text) {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = 'chatbot-msg user is-new';
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        setupScrollTellingUI();
        history.push({ type: 'user', text, time: Date.now() });
        saveHistory();
    }

    function setQuickButtons(buttons) {
        if (!quick) return;
        quick.innerHTML = '';
        quick.style.display = buttons.length ? 'flex' : 'none';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'chatbot-chip';
            button.textContent = btn.label;
            button.addEventListener('click', () => {
                quick.style.display = 'none';
                btn.onClick();
            });
            quick.appendChild(button);
        });
    }

    function go(url) {
        if (url.includes('#')) {
            const [page, anchor] = url.split('#');
            window.location.href = page + '#' + anchor;
        } else {
            window.location.href = url;
        }
    }

    function openWhatsApp(context = 'general') {
        let message = 'Hola Loyca, ';
        switch (context) {
            case 'contacto':
                message += 'quiero hablar con una persona de su equipo.';
                break;
            case 'tiempos':
                message += 'tengo una consulta sobre tiempos y plazos de entrega.';
                break;
            default:
                message += 'necesito más información sobre sus servicios.';
        }
        window.open(`${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
    }

    function openChat() {
        root.classList.add('is-open');
        if (input) input.focus();
        saveState();
    }

    function closeChat() {
        root.classList.remove('is-open');
        saveState();
    }

    function saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {}
    }

    function saveState() {
        try {
            localStorage.setItem('loyca_chat_open', root.classList.contains('is-open') ? '1' : '0');
        } catch (e) {}
    }

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
        history = [];
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
            pushUser('Servicios que ofrecen');
            pushBot('Te cuento nuestros servicios principales: Publicidad y Marketing, Desarrollo Web y Ciencia de Datos. ¿Cuál te gustaría conocer?').then(() => {
                setQuickButtons([
                    { label: 'Publicidad y Marketing', onClick: () => { pushUser('Publicidad y Marketing'); go(LINKS.publicidad); } },
                    { label: 'Desarrollo Web', onClick: () => { pushUser('Desarrollo Web'); go(LINKS.web); } },
                    { label: 'Ciencia de Datos', onClick: () => { pushUser('Ciencia de Datos'); go(LINKS.datos); } },
                    { label: 'Rubros', onClick: () => handleIntent('rubros') },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') }
                ]);
            });
            return;
        }

        if (intent === 'rubros') {
            pushUser('Rubros con los que trabajan');
            pushBot('Trabajamos con marcas y negocios que quieren crecer con estrategia y datos. Algunos rubros con los que tenemos experiencia: Salud (clínicas, odontología, estética), Gastronomía, Retail y e-commerce, Servicios profesionales, Inmobiliarias, Educación, Turismo y hotelería, Fitness y bienestar. ¿De qué rubro es tu negocio?').then(() => {
                setQuickButtons([
                    { label: 'Salud / Estética', onClick: () => { pushUser('Salud / Estética'); pushBot('Entendido. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.'); } },
                    { label: 'Gastronomía', onClick: () => { pushUser('Gastronomía'); pushBot('Perfecto. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.'); } },
                    { label: 'Tienda / E-commerce', onClick: () => { pushUser('Tienda / E-commerce'); pushBot('Excelente. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.'); } },
                    { label: 'Servicios Profesionales', onClick: () => { pushUser('Servicios Profesionales'); pushBot('Muy bien. Si querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.'); } },
                    { label: 'Otro rubro', onClick: () => { if (input) input.focus(); } },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') }
                ]);
            });
            return;
        }

        if (intent === 'precios') {
            pushUser('Precios de presupuestos');
            pushBot('El precio depende de lo que necesites y del alcance del proyecto. Para poder cotizarte correctamente, primero completá el formulario del servicio que te interesa y con esa información te enviamos el presupuesto.').then(() => {
                setQuickButtons([
                    { label: 'Formulario Publicidad y Marketing', onClick: () => { pushUser('Formulario Publicidad y Marketing'); go(LINKS.publicidad); } },
                    { label: 'Formulario Ciencia de Datos', onClick: () => { pushUser('Formulario Ciencia de Datos'); go(LINKS.datos); } },
                    { label: 'Formulario Desarrollo Web', onClick: () => { pushUser('Formulario Desarrollo Web'); go(LINKS.web); } },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: 'Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'proceso') {
            pushUser('Proceso de trabajo');
            pushBot('Nuestro proceso de trabajo es simple: 1) Completás el formulario del servicio que te interesa 2) Revisamos la información y definimos objetivos juntos 3) Te enviamos una propuesta y presupuesto 4) Si avanzamos, planificamos y ejecutamos con seguimiento y mejoras constantes.').then(() => {
                setQuickButtons([
                    { label: 'Servicios', onClick: () => handleIntent('servicios') },
                    { label: 'Completar formulario', onClick: () => handleIntent('precios') },
                    { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: 'Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'tiempos') {
            pushUser('Tiempos y plazos');
            pushBot('Los tiempos y resultados dependen del proyecto y la urgencia. Para darte una respuesta precisa, ¿te gustaría hablar con una persona por WhatsApp?').then(() => {
                setQuickButtons([
                    { label: 'Hablar por WhatsApp', onClick: () => openWhatsApp('tiempos') },
                    { label: 'Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'contacto') {
            pushUser('Quiero hablar con una persona');
            pushBot('Te paso a WhatsApp para que hables con una persona de nuestro equipo.');
            window.open(WHATSAPP, '_blank');
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
});
