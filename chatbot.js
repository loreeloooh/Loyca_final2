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

    if (!root || !fab || !win || !closeBtn || !messages || !quick || !form || !input) {
        console.error('Missing chatbot elements');
        return;
    }

    console.log('All chatbot elements found');

    const WHATSAPP = 'https://wa.me/5493413138290';
    const STORAGE_KEY = 'loyca_chat_history_v1';
    const DISCOUNT_SPIN_KEY = 'loyca_discount_spin_used_v1';
    const DISCOUNT_RESULT_KEY = 'loyca_discount_spin_result_v1';
    const DISCOUNT_DATE_KEY = 'loyca_discount_spin_date_v1';
    const DISCOUNT_PRIZES = [
        {
            color: '#2563eb',
            label: 'Azul',
            text: '20% OFF en pack de 7 post + 16 historias mensuales para Facebook e Instagram'
        },
        {
            color: '#7c3aed',
            label: 'Violeta',
            text: '20% OFF en pack de 9 post + 20 historias mensuales para Facebook e Instagram'
        },
        {
            color: '#ec4899',
            label: 'Rosa',
            text: '15% OFF en pack de 4 post mensuales + 15 historias mensuales para Facebook e Instagram'
        },
        {
            color: '#f39c12',
            label: 'Dorado',
            text: '7 OFF por 3 meses en pack de 7 post + 16 historias mensuales para Facebook e Instagram + Ads'
        }
    ];

    const isInFrontend = /\/frontend\//i.test(window.location.pathname.replace(/\\/g, '/'));
    const prefix = isInFrontend ? '../' : '';

    const LINKS = {
        publicidad: `${prefix}frontend/publicidad-redes.html#socialMediaForm`,
        datos: `${prefix}frontend/ciencia-datos.html#kpiContactForm`,
        web: `${prefix}frontend/desarrollo-web.html#webDevForm`
    };

    let fallbackCount = 0;
    let discountModal = null;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
        history = [];
    }

    function saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {}
    }

    function go(url) {
        if (url.includes('#')) {
            const [page, anchor] = url.split('#');
            window.location.href = page + '#' + anchor;
        } else {
            window.location.href = url;
        }
    }

    function pushBot(text) {
        return new Promise(resolve => {
            const typing = document.createElement('div');
            typing.className = 'chatbot-msg bot is-typing';
            typing.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>Escribiendo...';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            setTimeout(() => {
                if (typing.parentNode) typing.remove();
                const div = document.createElement('div');
                div.className = 'chatbot-msg bot is-new';
                div.textContent = text;
                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
                history.push({ type: 'bot', text, time: Date.now() });
                saveHistory();
                resolve();
            }, 1000);
        });
    }

    function pushUser(text) {
        const div = document.createElement('div');
        div.className = 'chatbot-msg user is-new';
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        history.push({ type: 'user', text, time: Date.now() });
        saveHistory();
    }

    function updateScrollIndicators() {
        if (!quick) return;
        
        const scrollHeight = quick.scrollHeight;
        const scrollTop = quick.scrollTop;
        const clientHeight = quick.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        
        quick.classList.toggle('has-top-scroll', scrollTop > 10);
        quick.classList.toggle('has-bottom-scroll', scrollTop < maxScroll - 10);
    }

    function getDiscountSpinUsed() {
        try {
            return localStorage.getItem(DISCOUNT_SPIN_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function getDiscountSpinResult() {
        try {
            return localStorage.getItem(DISCOUNT_RESULT_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    function getDiscountSpinDate() {
        try {
            return localStorage.getItem(DISCOUNT_DATE_KEY) || '';
        } catch (e) {
            return '';
        }
    }

    function setDiscountSpinResult(prize) {
        try {
            localStorage.setItem(DISCOUNT_SPIN_KEY, '1');
            localStorage.setItem(DISCOUNT_RESULT_KEY, JSON.stringify(prize));
            localStorage.setItem(DISCOUNT_DATE_KEY, String(Date.now()));
        } catch (e) {}
    }

    function formatDiscountPrize(prize) {
        if (!prize) return '';
        return prize.text || '';
    }

    function normalizeStoredPrize(rawPrize) {
        if (!rawPrize) return null;

        if (typeof rawPrize === 'object' && rawPrize.text) {
            return rawPrize;
        }

        if (typeof rawPrize === 'string') {
            try {
                const parsed = JSON.parse(rawPrize);
                if (parsed && parsed.text) {
                    return parsed;
                }
            } catch (e) {}

            return DISCOUNT_PRIZES.find((prize) => prize.text === rawPrize) || {
                color: '#2563eb',
                label: 'Premio',
                text: rawPrize
            };
        }

        return null;
    }

    function getDiscountValidityInfo(rawDate) {
        const timestamp = Number(rawDate);

        if (!timestamp || Number.isNaN(timestamp)) {
            return null;
        }

        const issuedAt = new Date(timestamp);
        const expiresAt = new Date(timestamp + 7 * 24 * 60 * 60 * 1000);

        const formatter = new Intl.DateTimeFormat('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        return {
            issuedAt,
            expiresAt,
            issuedLabel: formatter.format(issuedAt),
            expiresLabel: formatter.format(expiresAt)
        };
    }

    function formatDiscountValidityText(rawDate) {
        const validity = getDiscountValidityInfo(rawDate);

        if (!validity) {
            return '';
        }

        return `Válido desde ${validity.issuedLabel} hasta ${validity.expiresLabel}.`;
    }

    function ensureDiscountModal() {
        if (discountModal) return discountModal;

        const overlay = document.createElement('div');
        overlay.id = 'chatbotDiscountModal';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(15, 23, 42, 0.72)';
        overlay.style.display = 'none';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '12px';
        overlay.style.zIndex = '99999';

        const card = document.createElement('div');
        card.style.width = '100%';
        card.style.maxWidth = '390px';
        card.style.maxHeight = 'calc(100vh - 24px)';
        card.style.overflowY = 'auto';
        card.style.background = 'linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94))';
        card.style.borderRadius = '20px';
        card.style.padding = '18px';
        card.style.boxShadow = '0 24px 60px rgba(2, 6, 23, 0.45)';
        card.style.fontFamily = 'Poppins, sans-serif';

        card.style.textAlign = 'center';
        card.style.position = 'relative';
        card.style.border = '1px solid rgba(243, 156, 18, 0.24)';
        card.style.backdropFilter = 'blur(14px)';

        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = '×';
        close.style.position = 'absolute';
        close.style.top = '8px';
        close.style.right = '10px';
        close.style.border = 'none';
        close.style.background = 'transparent';
        close.style.fontSize = '26px';
        close.style.cursor = 'pointer';
        close.style.color = 'rgba(248, 250, 252, 0.92)';

        const title = document.createElement('h3');
        title.textContent = 'Ruleta de descuentos Loyca';
        title.style.margin = '0 0 8px';
        title.style.fontSize = '18px';
        title.style.paddingRight = '22px';
        title.style.color = '#f8fafc';
        title.style.textShadow = '0 0 14px rgba(243, 156, 18, 0.28)';

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Este mes por el lanzamiento de nuestra web tenés 1 oportunidad para conseguir un descuento.';
        subtitle.style.margin = '0 0 12px';
        subtitle.style.fontSize = '12px';
        subtitle.style.lineHeight = '1.4';
        subtitle.style.color = 'rgba(226, 232, 240, 0.84)';

        const wheelWrap = document.createElement('div');
        wheelWrap.style.position = 'relative';
        wheelWrap.style.width = '220px';
        wheelWrap.style.margin = '0 auto 12px';
        wheelWrap.style.paddingTop = '18px';

        const wheel = document.createElement('div');
        wheel.style.width = '220px';
        wheel.style.height = '220px';
        wheel.style.borderRadius = '50%';
        wheel.style.margin = '0 auto';
        wheel.style.border = '7px solid #ffffff';
        wheel.style.boxShadow = '0 16px 36px rgba(2, 6, 23, 0.4), 0 0 24px rgba(243, 156, 18, 0.16)';
        wheel.style.background = `conic-gradient(${DISCOUNT_PRIZES[0].color} 0deg 90deg, ${DISCOUNT_PRIZES[1].color} 90deg 180deg, ${DISCOUNT_PRIZES[2].color} 180deg 270deg, ${DISCOUNT_PRIZES[3].color} 270deg 360deg)`;
        wheel.style.position = 'relative';
        wheel.style.transition = 'transform 4.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
        wheel.style.zIndex = '1';

        const center = document.createElement('div');
        center.style.position = 'absolute';
        center.style.top = '50%';
        center.style.left = '50%';
        center.style.transform = 'translate(-50%, -50%)';
        center.style.width = '72px';
        center.style.height = '72px';
        center.style.borderRadius = '50%';
        center.style.background = '#ffffff';
        center.style.display = 'flex';
        center.style.alignItems = 'center';
        center.style.justifyContent = 'center';
        center.style.fontSize = '11px';
        center.style.fontWeight = '700';
        center.style.color = '#0f172a';
        center.style.padding = '8px';
        center.style.boxShadow = '0 0 0 4px rgba(243, 156, 18, 0.18), 0 8px 18px rgba(2, 6, 23, 0.2)';
        center.textContent = '1 GIRO';

        const pointer = document.createElement('div');
        pointer.style.position = 'absolute';
        pointer.style.top = '0';
        pointer.style.left = '50%';
        pointer.style.transform = 'translateX(-50%)';
        pointer.style.width = '0';
        pointer.style.height = '0';
        pointer.style.borderLeft = '14px solid transparent';
        pointer.style.borderRight = '14px solid transparent';
        pointer.style.borderTop = '24px solid #f59e0b';
        pointer.style.filter = 'drop-shadow(0 4px 8px rgba(243, 156, 18, 0.34))';
        pointer.style.zIndex = '3';

        const labels = document.createElement('div');
        labels.style.display = 'grid';
        labels.style.gap = '8px';
        labels.style.margin = '0 0 12px';
        labels.style.textAlign = 'left';
        DISCOUNT_PRIZES.forEach((prize, index) => {
            const item = document.createElement('div');
            item.style.display = 'grid';
            item.style.gridTemplateColumns = '12px 1fr';
            item.style.gap = '10px';
            item.style.alignItems = 'center';
            item.style.fontSize = '11px';
            item.style.lineHeight = '1.45';
            item.style.color = 'rgba(226, 232, 240, 0.88)';
            item.style.background = 'rgba(255, 255, 255, 0.04)';
            item.style.padding = '10px 12px';
            item.style.borderRadius = '14px';
            item.style.border = '1px solid rgba(255, 255, 255, 0.07)';
            item.style.boxShadow = '0 6px 18px rgba(2, 6, 23, 0.12)';

            const bullet = document.createElement('span');
            bullet.style.width = '12px';
            bullet.style.height = '12px';
            bullet.style.borderRadius = '999px';
            bullet.style.background = prize.color;
            bullet.style.display = 'inline-block';
            bullet.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.92), 0 0 0 5px rgba(255, 255, 255, 0.05)';

            const text = document.createElement('div');
            text.innerHTML = `<strong>${prize.label}</strong>: ${prize.text}`;
            text.style.letterSpacing = '0.01em';

            item.appendChild(bullet);
            item.appendChild(text);
            labels.appendChild(item);
        });

        const result = document.createElement('div');
        result.style.minHeight = '38px';
        result.style.marginBottom = '10px';
        result.style.fontSize = '12px';
        result.style.lineHeight = '1.4';
        result.style.fontWeight = '600';
        result.style.color = '#f8fafc';

        const validity = document.createElement('div');
        validity.style.minHeight = '30px';
        validity.style.marginBottom = '12px';
        validity.style.fontSize = '11px';
        validity.style.lineHeight = '1.5';
        validity.style.color = 'rgba(226, 232, 240, 0.74)';

        const spin = document.createElement('button');
        spin.type = 'button';
        spin.textContent = 'Girar ruleta';
        spin.style.border = 'none';
        spin.style.borderRadius = '999px';
        spin.style.padding = '10px 16px';
        spin.style.background = 'linear-gradient(135deg, #f39c12 0%, #ffb347 100%)';
        spin.style.color = '#ffffff';
        spin.style.fontWeight = '700';
        spin.style.cursor = 'pointer';
        spin.style.width = '100%';
        spin.style.fontSize = '14px';
        spin.style.boxShadow = '0 10px 24px rgba(243, 156, 18, 0.22)';

        close.addEventListener('click', () => {
            overlay.style.display = 'none';
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                overlay.style.display = 'none';
            }
        });

        spin.addEventListener('click', () => {
            if (spin.disabled) return;

            const selectedIndex = Math.floor(Math.random() * DISCOUNT_PRIZES.length);
            const selectedPrize = DISCOUNT_PRIZES[selectedIndex];
            const segmentDegrees = 360 / DISCOUNT_PRIZES.length;
            const targetRotation = (360 - (selectedIndex * segmentDegrees + segmentDegrees / 2)) % 360;
            const extraTurns = 1800;

            spin.disabled = true;
            spin.style.opacity = '0.7';
            spin.style.cursor = 'not-allowed';
            result.textContent = 'Girando...';
            validity.textContent = '';
            wheel.style.transform = `rotate(${extraTurns + targetRotation}deg)`;

            window.setTimeout(() => {
                setDiscountSpinResult(selectedPrize);
                const validityText = formatDiscountValidityText(getDiscountSpinDate());
                result.textContent = `¡Te tocó ${selectedPrize.label}: ${selectedPrize.text}!`;
                result.style.color = selectedPrize.color;
                validity.textContent = validityText;
                pushBot(`¡Felicitaciones! Tu premio es: ${selectedPrize.text}. ${validityText} Si querés, te derivamos por WhatsApp para activarlo.`).then(() => {
                    setQuickButtons([
                        { label: '💬 Activar por WhatsApp', onClick: () => handleIntent('contacto') },
                        { label: '🔙 Volver al menú', onClick: () => showMainMenu() }
                    ]);
                });
            }, 4300);
        });

        wheel.appendChild(center);
        wheelWrap.appendChild(pointer);
        wheelWrap.appendChild(wheel);
        card.appendChild(close);
        card.appendChild(title);
        card.appendChild(subtitle);
        card.appendChild(wheelWrap);
        card.appendChild(labels);
        card.appendChild(result);
        card.appendChild(validity);
        card.appendChild(spin);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        discountModal = { overlay, wheel, result, validity, spin };
        return discountModal;
    }

    function openDiscountWheel() {
        const modal = ensureDiscountModal();
        const used = getDiscountSpinUsed();
        const previousPrize = normalizeStoredPrize(getDiscountSpinResult());
        const validityText = formatDiscountValidityText(getDiscountSpinDate());

        modal.overlay.style.display = 'flex';
        modal.wheel.style.transform = 'rotate(0deg)';

        if (used && previousPrize) {
            modal.result.textContent = `Ya usaste tu giro. Tu premio fue ${previousPrize.label}: ${previousPrize.text}.`;
            modal.result.style.color = previousPrize.color;
            modal.validity.textContent = validityText;
            modal.spin.disabled = true;
            modal.spin.textContent = 'Giro ya utilizado';
            modal.spin.style.opacity = '0.7';
            modal.spin.style.cursor = 'not-allowed';
        } else {
            modal.result.textContent = 'Probá suerte y descubrí tu descuento.';
            modal.result.style.color = '#f8fafc';
            modal.validity.textContent = 'El descuento es válido por 1 semana desde el día en que hagas girar la ruleta.';
            modal.spin.disabled = false;
            modal.spin.textContent = 'Girar ruleta';
            modal.spin.style.opacity = '1';
            modal.spin.style.cursor = 'pointer';
        }
    }

    function setQuickButtons(buttons) {
        quick.innerHTML = '';
        quick.style.display = buttons.length ? 'grid' : 'none';
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
        
        setTimeout(updateScrollIndicators, 100);
    }

    function openChat() {
        root.classList.add('is-open');
        input.focus();
    }

    function closeChat() {
        root.classList.remove('is-open');
    }

    function showMainMenu() {
        fallbackCount = 0;
        setQuickButtons([
            { label: '🚀 Ver servicios', onClick: () => handleIntent('servicios') },
            { label: '🧠 ¿Trabajan con mi rubro?', onClick: () => handleIntent('rubros') },
            { label: '💰 Consultar precios', onClick: () => handleIntent('precios') },
            { label: '🎁 ¿Tienen descuentos?', onClick: () => handleIntent('descuentos') },
            { label: '👥 Conocer al equipo', onClick: () => handleIntent('equipo') },
            { label: '💬 Hablar con una persona', onClick: () => handleIntent('contacto') }
        ]);
    }

    function showObjectiveButtons() {
        setQuickButtons([
            { label: '💰 Aumentar ventas', onClick: () => handleObjective('Aumentar ventas') },
            { label: '🎯 Conseguir más clientes', onClick: () => handleObjective('Conseguir más clientes') },
            { label: '📈 Mejorar posicionamiento', onClick: () => handleObjective('Mejorar posicionamiento') },
            { label: '⚙️ Automatizar procesos', onClick: () => handleObjective('Automatizar procesos') },
            { label: '📊 Analizar datos', onClick: () => handleObjective('Analizar datos') },
            { label: '🌐 Crear presencia online', onClick: () => handleObjective('Crear presencia online') },
            { label: '🔄 Optimizar estrategia', onClick: () => handleObjective('Optimizar estrategia') },
            { label: '✍️ Otro', onClick: () => handleObjective('Otro') },
            { label: '🔙 Volver', onClick: () => handleIntent('rubros') }
        ]);
    }

    function showObjectiveOptions(industryLabel) {
        pushBot(`Perfecto. Ya veo que tu negocio está dentro del rubro ${industryLabel}.\n\nPara orientarte mejor, contame cuál es el principal objetivo o necesidad que querés resolver.`).then(() => {
            showObjectiveButtons();
        });
    }

    function handleObjective(objective) {
        pushUser(objective);

        const responses = {
            'Aumentar ventas': 'Perfecto. Si tu objetivo es aumentar ventas, podemos ayudarte a definir la mejor estrategia según tu rubro y el servicio que más se adapte a tu negocio.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Conseguir más clientes': 'Perfecto. Si tu objetivo es conseguir más clientes, podemos ayudarte a trabajar una estrategia enfocada en captación, posicionamiento y conversión.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Mejorar posicionamiento': 'Perfecto. Si tu objetivo es mejorar posicionamiento, podemos ayudarte a fortalecer tu presencia, comunicar mejor tu propuesta y ordenar tu estrategia digital.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Automatizar procesos': 'Perfecto. Si tu objetivo es automatizar procesos, podemos ayudarte a detectar oportunidades de mejora para ganar tiempo, orden y eficiencia.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Analizar datos': 'Perfecto. Si tu objetivo es analizar datos, podemos ayudarte a transformar información en decisiones más claras y rentables.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Crear presencia online': 'Perfecto. Si tu objetivo es crear presencia online, podemos ayudarte a construir una base digital sólida para que tu negocio se vea profesional y genere confianza.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Optimizar estrategia': 'Perfecto. Si tu objetivo es optimizar estrategia, podemos ayudarte a ordenar prioridades, mejorar acciones actuales y enfocar mejor tus recursos.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.',
            'Otro': 'Perfecto. Podemos ayudarte a evaluar tu necesidad y orientarte hacia la mejor solución según tu caso.\n\nEl siguiente paso ideal es completar el formulario para que podamos analizar tu caso con más precisión.'
        };

        pushBot(responses[objective]).then(() => {
            setQuickButtons([
                { label: '📄 Completar formulario', onClick: () => handleIntent('precios') },
                { label: '💬 Hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                { label: '🔙 Otra consulta', onClick: () => showMainMenu() }
            ]);
        });
    }

    function showSpecificService(title, description, formLink) {
        pushUser(title);
        pushBot(description).then(() => {
            setQuickButtons([
                { label: '📄 Ir al formulario', onClick: () => { pushUser('📄 Ir al formulario'); go(formLink); } },
                { label: '🔄 Ver otro servicio', onClick: () => handleIntent('todos_servicios') },
                { label: '🔙 Volver', onClick: () => handleIntent('servicios') }
            ]);
        });
    }

    function showPriceFlow(serviceName, formLink, message) {
        pushUser(serviceName);
        pushBot(message).then(() => {
            setQuickButtons([
                { label: '📄 Ir al formulario', onClick: () => { pushUser('📄 Ir al formulario'); go(formLink); } },
                { label: '💬 Hablar con experto', onClick: () => handleIntent('contacto') },
                { label: '🔙 Volver', onClick: () => handleIntent('precios') }
            ]);
        });
    }

    function handleIntent(intent) {
        if (intent === 'servicios') {
            pushUser('🚀 Ver servicios');
            pushBot('En Loyca trabajamos con tres áreas principales para ayudar a marcas y negocios a crecer con estrategia, creatividad y datos.\n\n¿Qué servicio te interesa conocer?').then(() => {
                setQuickButtons([
                    { label: '📣 Publicidad y Redes', onClick: () => handleIntent('publicidad') },
                    { label: '🌐 Desarrollo Web', onClick: () => handleIntent('web') },
                    { label: '📊 Datos y Análisis', onClick: () => handleIntent('datos') },
                    { label: '📦 Ver todos los servicios', onClick: () => handleIntent('todos_servicios') },
                    { label: '🔙 Volver al menú', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'publicidad') {
            pushUser('📣 Publicidad y Redes');
            pushBot('En Publicidad y Redes ayudamos a que tu marca gane visibilidad, conecte con su audiencia y convierta mejor.\n\nIncluye servicios como:\n- Gestión de redes sociales\n- Publicidad en Meta Ads\n- Google Ads\n- Estrategia de contenidos\n- Branding y creatividad\n- Optimización de campañas\n\nAdemás, contamos con experiencia práctica y formación certificada para trabajar campañas con enfoque profesional y medible.\n\nSi querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.').then(() => {
                setQuickButtons([
                    { label: '📄 Ir al formulario', onClick: () => { pushUser('📄 Ir al formulario'); go(LINKS.publicidad); } },
                    { label: '💬 Hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: '🔙 Volver', onClick: () => handleIntent('servicios') }
                ]);
            });
            return;
        }

        if (intent === 'web') {
            pushUser('🌐 Desarrollo Web');
            pushBot('En Desarrollo Web creamos sitios modernos, funcionales y pensados para comunicar mejor tu propuesta y ayudarte a convertir visitas en consultas o ventas.\n\nPodemos ayudarte con:\n- Sitios institucionales\n- Landing pages\n- Webs corporativas\n- Tiendas online\n- Optimización para celulares\n- Mejoras de experiencia y estructura\n\nSi querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.').then(() => {
                setQuickButtons([
                    { label: '📄 Ir al formulario', onClick: () => { pushUser('📄 Ir al formulario'); go(LINKS.web); } },
                    { label: '💬 Hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: '🔙 Volver', onClick: () => handleIntent('servicios') }
                ]);
            });
            return;
        }

        if (intent === 'datos') {
            pushUser('📊 Datos y Análisis');
            pushBot('En Datos y Análisis trabajamos para transformar información en decisiones estratégicas.\n\nPodemos ayudarte con:\n- Análisis de datos\n- Dashboards y KPIs\n- Reportes ejecutivos\n- Automatización de procesos\n- Proyecciones y análisis predictivo\n- Optimización basada en datos\n\nSi querés avanzar, podés completar el formulario o hablar con una persona por WhatsApp.').then(() => {
                setQuickButtons([
                    { label: '📄 Ir al formulario', onClick: () => { pushUser('📄 Ir al formulario'); go(LINKS.datos); } },
                    { label: '💬 Hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: '🔙 Volver', onClick: () => handleIntent('servicios') }
                ]);
            });
            return;
        }

        if (intent === 'todos_servicios') {
            pushUser('📦 Ver todos los servicios');
            pushBot('Además de nuestras tres áreas principales, también trabajamos con servicios específicos según la necesidad de cada proyecto.\n\nElegí el que te interese:').then(() => {
                setQuickButtons([
                    { label: 'Meta Ads', onClick: () => showSpecificService('Meta Ads', 'Meta Ads es ideal para promocionar tu marca, producto o servicio en Facebook e Instagram con campañas segmentadas y orientadas a resultados.\n\nPodemos ayudarte con estrategia, segmentación, creatividad, optimización y análisis de rendimiento.', LINKS.publicidad) },
                    { label: 'E-commerce', onClick: () => showSpecificService('E-commerce', 'E-commerce es ideal si querés vender online con una tienda funcional, clara y preparada para acompañar el crecimiento de tu negocio.\n\nPodemos ayudarte con catálogo, estructura, pagos, experiencia de usuario y optimización comercial.', LINKS.web) },
                    { label: 'SEO', onClick: () => showSpecificService('SEO', 'SEO es ideal si querés mejorar la visibilidad de tu sitio en buscadores y atraer tráfico más calificado.\n\nPodemos ayudarte con estructura, contenidos, optimización técnica y estrategia de posicionamiento.', LINKS.web) },
                    { label: 'Análisis Predictivo', onClick: () => showSpecificService('Análisis Predictivo', 'El análisis predictivo permite anticipar comportamientos, detectar patrones y tomar decisiones con mayor fundamento.\n\nPodemos ayudarte a aplicar análisis y modelos que conviertan datos en proyecciones útiles para el negocio.', LINKS.datos) },
                    { label: 'Otros', onClick: () => showSpecificService('Otros', 'También trabajamos con otras soluciones vinculadas a estrategia digital, automatización, optimización, presencia online y proyectos a medida.\n\nSi querés, podés contarnos tu necesidad y te orientamos.', LINKS.publicidad) },
                    { label: '🔙 Volver', onClick: () => handleIntent('servicios') }
                ]);
            });
            return;
        }

        if (intent === 'rubros') {
            pushUser('🧠 ¿Trabajan con mi rubro?');
            pushBot('Trabajamos con marcas y negocios que quieren crecer con estrategia y datos.\n\nTenemos experiencia en rubros como:\n- Salud\n- Gastronomía\n- Retail\n- Servicios profesionales\n- Educación\n- Turismo\n\n¿De qué rubro es tu negocio?').then(() => {
                setQuickButtons([
                    { label: 'Salud', onClick: () => { pushUser('Salud'); showObjectiveOptions('Salud'); } },
                    { label: 'Gastronomía', onClick: () => { pushUser('Gastronomía'); showObjectiveOptions('Gastronomía'); } },
                    { label: 'Retail', onClick: () => { pushUser('Retail'); showObjectiveOptions('Retail'); } },
                    { label: 'Servicios Profesionales', onClick: () => { pushUser('Servicios Profesionales'); showObjectiveOptions('Servicios Profesionales'); } },
                    { label: 'Educación', onClick: () => { pushUser('Educación'); showObjectiveOptions('Educación'); } },
                    { label: 'Turismo', onClick: () => { pushUser('Turismo'); showObjectiveOptions('Turismo'); } },
                    { label: 'Otro', onClick: () => { pushUser('Otro'); pushBot('Perfecto. Aunque no esté dentro de los rubros listados, podemos orientarte igual.\n\nContame cuál es el principal objetivo o necesidad que querés resolver.').then(() => {
                        showObjectiveButtons();
                    }); } },
                    { label: '🔙 Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'precios') {
            pushUser('💰 Consultar precios');
            pushBot('Los precios dependen del alcance, la complejidad y el tipo de servicio que necesites.\n\nPara orientarte mejor, elegí el área sobre la que querés consultar:').then(() => {
                setQuickButtons([
                    { label: '📄 Publicidad y Marketing', onClick: () => showPriceFlow('📄 Publicidad y Marketing', LINKS.publicidad, 'En Publicidad y Marketing el presupuesto depende de factores como objetivos, cantidad de campañas, canales, piezas creativas y nivel de seguimiento.\n\nSi querés una cotización realista, lo mejor es que completes el formulario.') },
                    { label: '📄 Desarrollo Web', onClick: () => showPriceFlow('📄 Desarrollo Web', LINKS.web, 'En Desarrollo Web el presupuesto depende del tipo de sitio, funcionalidades, cantidad de secciones, integraciones y objetivos del proyecto.\n\nSi querés una cotización realista, lo mejor es que completes el formulario.') },
                    { label: '📄 Ciencia de Datos', onClick: () => showPriceFlow('📄 Ciencia de Datos', LINKS.datos, 'En Ciencia de Datos el presupuesto depende del tipo de análisis, cantidad de datos, complejidad técnica, automatizaciones y resultados esperados.\n\nSi querés una cotización realista, lo mejor es que completes el formulario.') },
                    { label: '🔙 Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'descuentos') {
            pushUser('🎁 ¿Tienen descuentos?');

            const previousPrize = normalizeStoredPrize(getDiscountSpinResult());
            const validityText = formatDiscountValidityText(getDiscountSpinDate());
            const promoMessage = getDiscountSpinUsed() && previousPrize
                ? `Este mes por lanzamiento de nuestra web podés participar de una ruleta con 1 oportunidad para conseguir un descuento.\n\nTu giro ya fue utilizado y tu premio fue: ${formatDiscountPrize(previousPrize)}. ${validityText}`
                : 'Este mes por lanzamiento de nuestra web podés participar de una ruleta y tenés 1 oportunidad para conseguir un descuento en nuestros packs de publicidad. El descuento que te toque será válido por 1 semana desde el día del giro.';

            pushBot(promoMessage).then(() => {
                setQuickButtons([
                    { label: '🎡 Abrir ruleta', onClick: () => openDiscountWheel() },
                    { label: '💬 Hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                    { label: '🔙 Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'equipo') {
            pushUser('👥 Conocer al equipo');
            pushBot('En Loyca trabajamos integrando estrategia, creatividad, desarrollo y análisis para ayudar a negocios a crecer de forma más clara, profesional y medible.\n\nSomos un equipo enfocado en combinar marketing, desarrollo web y datos para crear soluciones que no solo se vean bien, sino que también generen resultados.\n\nSi querés, podés ver nuestros servicios, solicitar un presupuesto o hablar directamente con una persona del equipo.').then(() => {
                setQuickButtons([
                    { label: '🚀 Ver servicios', onClick: () => handleIntent('servicios') },
                    { label: '📄 Solicitar presupuesto', onClick: () => handleIntent('precios') },
                    { label: '💬 Hablar con el equipo', onClick: () => handleIntent('contacto') },
                    { label: '🔙 Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'contacto') {
            pushUser('💬 Hablar con una persona');
            pushBot('Perfecto. Te paso a WhatsApp para que hables con una persona de nuestro equipo.');
            window.open(WHATSAPP, '_blank');
            return;
        }

        fallbackCount += 1;
        const fallbackMessage = fallbackCount === 1
            ? 'No entendí del todo tu consulta, pero puedo ayudarte si elegís una opción del menú o me contás un poco más.'
            : 'Como todavía estoy aprendiendo, te pido disculpas si no entendí bien. Te recomiendo volver al menú para elegir una opción y así poder ayudarte mejor.';

        pushBot(fallbackMessage).then(() => {
            setQuickButtons([
                { label: '🔙 Volver al menú', onClick: () => showMainMenu() },
                { label: '✍️ Escribir consulta', onClick: () => input.focus() }
            ]);
        });
    }

    function routeText(text) {
        const t = (text || '')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim();

        if (!t) return;

        if (t.includes('servicio') || t.includes('marketing') || t.includes('publicidad') || t.includes('web') || t.includes('datos')) {
            handleIntent('servicios');
            return;
        }

        if (t.includes('rubro') || t.includes('industria') || t.includes('sector')) {
            handleIntent('rubros');
            return;
        }

        if (t.includes('precio') || t.includes('costo') || t.includes('presupuesto')) {
            handleIntent('precios');
            return;
        }

        if (t.includes('descuento') || t.includes('descuentos') || t.includes('promo') || t.includes('promocion') || t.includes('ruleta')) {
            handleIntent('descuentos');
            return;
        }

        if (t.includes('equipo') || t.includes('quienes son') || t.includes('empresa')) {
            handleIntent('equipo');
            return;
        }

        if (t.includes('whatsapp') || t.includes('persona') || t.includes('hablar') || t.includes('contacto')) {
            handleIntent('contacto');
            return;
        }

        handleIntent('fallback');
    }

    // Event listeners
    fab.addEventListener('click', () => {
        const isOpen = root.classList.contains('is-open');
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    });

    closeBtn.addEventListener('click', closeChat);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        pushUser(text);
        input.value = '';

        setTimeout(() => {
            routeText(text);
        }, 300);
    });

    // Add scroll event listener for quick buttons area
    if (quick) {
        quick.addEventListener('scroll', updateScrollIndicators);
    }

    // Initialize
    if (history.length > 0) {
        history.forEach(msg => {
            const div = document.createElement('div');
            div.className = `chatbot-msg ${msg.type}`;
            div.textContent = msg.text;
            messages.appendChild(div);
        });
        messages.scrollTop = messages.scrollHeight;
        showMainMenu();
    } else {
        pushBot('¡Hola! Soy el asistente virtual de Loyca.\nEstoy para ayudarte a encontrar el servicio ideal para tu negocio.\n\nPodés elegir una de estas opciones:').then(() => {
            showMainMenu();
        });
    }

    try {
        if (localStorage.getItem('loyca_chat_open') === '1') {
            openChat();
        }
    } catch (e) {
    }
})();

});
