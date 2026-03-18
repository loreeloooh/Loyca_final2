document.addEventListener('DOMContentLoaded', function() {
    console.log('Chatbot script loaded');
    
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

    const isInFrontend = /\/frontend\//i.test(window.location.pathname.replace(/\\/g, '/'));
    const prefix = isInFrontend ? '../' : '';

    const LINKS = {
        publicidad: `${prefix}frontend/publicidad-redes.html#socialMediaForm`,
        datos: `${prefix}frontend/ciencia-datos.html#kpiContactForm`,
        web: `${prefix}frontend/ciencia-datos.html#webDevForm`
    };

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
        
        // Add/remove classes based on scroll position
        quick.classList.toggle('has-top-scroll', scrollTop > 10);
        quick.classList.toggle('has-bottom-scroll', scrollTop < maxScroll - 10);
    }

    function setQuickButtons(buttons) {
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
        
        // Update scroll indicators after buttons are added
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
        setQuickButtons([
            { label: 'Servicios que ofrecen', onClick: () => handleIntent('servicios') },
            { label: 'Rubros con los que trabajan', onClick: () => handleIntent('rubros') },
            { label: 'Precios de presupuestos', onClick: () => handleIntent('precios') },
            { label: 'Quiero hablar con una persona', onClick: () => handleIntent('contacto') }
        ]);
    }

    function handleMoreServices() {
        pushUser('Ver más servicios');
        pushBot('Aquí tienes todas nuestras opciones específicas:\n\n📱 **Marketing Digital:**\n• Publicidad en Meta Ads\n• Google Ads Performance\n• Email Marketing\n• Content Marketing\n• TikTok Ads\n• LinkedIn Ads\n• YouTube Ads\n• Influencer Marketing\n• Marketing de Afiliados\n• Publicidad Programática\n\n🎨 **Branding y Diseño:**\n• Identidad Visual Corporativa\n• Diseño Gráfico Profesional\n• Packaging y Etiquetas\n• Video Marketing\n• Diseño de Logotipos\n• Manual de Marca\n• Diseño UI/UX\n• Fotografía Comercial\n• Diseño de Presentaciones\n\n🛒 **E-commerce:**\n• Tiendas Online Completas\n• Marketplace Management\n• Logística E-commerce\n• Sistemas de Pagos\n• Gestión de Inventarios\n• Dropshipping\n• Multi-vendor Marketplace\n• Sistemas de Reservas\n\n🔍 **SEO y Posicionamiento:**\n• SEO On-Page\n• SEO Técnico\n• Link Building\n• SEO Local\n• SEO Internacional\n• Optimización de Contenido\n• Análisis de Competencia\n• SEO para E-commerce\n\n📈 **Data Science:**\n• Análisis Predictivo\n• Machine Learning\n• Automatización Inteligente\n• Data Mining\n• Business Intelligence\n• Big Data Analytics\n• Análisis de Sentimiento\n• Modelos Estadísticos\n• Visualización de Datos\n\n💻 **Desarrollo Avanzado:**\n• Desarrollo de APIs\n• Web Apps Progresivas (PWA)\n• Integración de Sistemas\n• Desarrollo de Plugins\n• Optimización de Rendimiento\n• Cloud Computing\n• Desarrollo Mobile\n\n¿Qué servicio específico te interesa?').then(() => {
            setQuickButtons([
                { label: 'Meta Ads', onClick: () => { pushUser('Meta Ads'); pushBot('📱 **Meta Ads (Facebook/Instagram Ads)**\n\nEs la publicidad pagada en la plataforma de Meta. Incluye:\n\n• Creación de campañas publicitarias\n• Segmentación avanzada de audiencia\n• Diseño de creativos publicitarios\n• Monitoreo y optimización de resultados\n• Reportes de rendimiento detallados\n\nPerfecto para empresas que quieren alcanzar clientes potenciales específicos y aumentar ventas rápidamente. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('Te redirijo al formulario de publicidad...'); } },
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Tiendas E-commerce', onClick: () => { pushUser('Tiendas E-commerce'); pushBot('🛒 **Tiendas E-commerce**\n\nEs el desarrollo de tiendas online completas con sistema de pagos. Incluye:\n\n• Catálogo de productos con fotos\n• Carrito de compras y checkout\n• Integración con pasarelas de pago\n• Panel de administración de productos\n• Sistema de envíos y tracking\n\nIdeal para empresas que quieren vender sus productos online 24/7. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('Te redirijo al formulario de desarrollo web...'); } },
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'SEO y Posicionamiento', onClick: () => { pushUser('SEO y Posicionamiento'); pushBot('🔍 **SEO y Posicionamiento Web**\n\nEs la optimización de tu sitio web para aparecer en los primeros resultados de Google. Incluye:\n\n• Análisis de palabras clave\n• Optimización on-page y técnica\n• Creación de contenido SEO friendly\n• Link building y estrategia de backlinks\n• Monitoreo de rankings y analytics\n\nPerfecto para empresas que quieren aumentar su visibilidad orgánica y atraer tráfico calificado. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('Te redirijo al formulario de desarrollo web...'); } },
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Análisis Predictivo', onClick: () => { pushUser('Análisis Predictivo'); pushBot('📈 **Análisis Predictivo**\n\nEs el uso de algoritmos de machine learning para predecir tendencias y comportamientos. Incluye:\n\n• Modelos predictivos personalizados\n• Análisis de patrones de comportamiento\n• Forecasting de ventas y demanda\n• Identificación de oportunidades de mercado\n• Dashboard con predicciones en tiempo real\n\nIdeal para empresas que quieren anticipar tendencias y tomar decisiones proactivas basadas en datos. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('Te redirijo al formulario de ciencia de datos...'); } },
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
            ]);
        });
    }

    function handleIntent(intent) {
        if (intent === 'servicios') {
            pushUser('Servicios que ofrecen');
            pushBot('Te cuento nuestros tres servicios principales:\n\n📢 **Publicidad y Redes:**\n• Gestión de Redes Sociales\n• Publicidad en Meta Ads (Facebook/Instagram)\n• Google Ads Performance\n• Email Marketing\n• Content Marketing\n• Branding y Diseño\n\n💻 **Desarrollo Web:**\n• Sitios Web Corporativos\n• Tiendas E-commerce\n• Aplicaciones Web\n• SEO y Optimización\n• Mantenimiento Web\n• Desarrollo de Landing Pages\n\n📊 **Datos:**\n• Análisis de Datos\n• Dashboards y KPIs\n• Business Intelligence\n• Automatización de Procesos\n• Machine Learning\n• Análisis Predictivo\n\n¿Cuál de estos servicios te interesa conocer en detalle?').then(() => {
                setQuickButtons([
                    { label: 'Gestión de Redes Sociales', onClick: () => { pushUser('Gestión de Redes Sociales'); pushBot('📱 **Gestión de Redes Sociales**\n\nEs el servicio completo de administración y optimización de tus perfiles sociales. Incluye:\n\n• Creación y programación de contenido\n• Gestión de community management\n• Monitoreo de métricas y analytics\n• Interacción con tu comunidad\n• Estrategias de crecimiento\n\nIdeal para empresas que quieren mantener presencia activa en redes sin dedicar tiempo interno. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                        setQuickButtons([
                            { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('¡Perfecto! Te voy a redirigir al formulario de publicidad y redes sociales. Allí podrás completar todos los detalles sobre tus necesidades y nos contactaremos contigo a la brevedad con una propuesta personalizada.\n\nTe redirijo al formulario de publicidad y redes sociales...').then(() => {
                                setQuickButtons([
                                    { label: 'Formulario', onClick: () => { pushUser('Formulario'); pushBot('Abriendo el formulario de publicidad y redes sociales...'); go(LINKS.publicidad); } },
                                    { label: 'Prefiero hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                                    { label: 'Volver', onClick: () => handleIntent('servicios') }
                                ]);
                            }); } },
                            { label: 'Ver otro servicio', onClick: () => handleIntent('servicios') },
                            { label: 'Volver al menú', onClick: () => showMainMenu() }
                        ]);
                    }); } },
                    { label: 'Sitios Web Corporativos', onClick: () => { pushUser('Sitios Web Corporativos'); pushBot('💻 **Sitios Web Corporativos**\n\nEs el desarrollo de páginas web profesionales para empresas. Incluye:\n\n• Diseño web moderno y responsive\n• Optimización para móviles y tablets\n• SEO básico para mejor posicionamiento\n• Integración con redes sociales\n• Panel de administración fácil\n\nPerfecto para empresas que necesitan una presencia digital profesional y confiable. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                        setQuickButtons([
                            { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('¡Excelente! Te voy a redirigir al formulario de desarrollo web. Allí podrás especificar el tipo de sitio que necesitas, características deseadas y objetivos de tu proyecto.\n\nTe redirijo al formulario de desarrollo web...').then(() => {
                                setQuickButtons([
                                    { label: 'Formulario', onClick: () => { pushUser('Formulario'); pushBot('Abriendo el formulario de desarrollo web...'); go(LINKS.web); } },
                                    { label: 'Prefiero hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                                    { label: 'Volver', onClick: () => handleIntent('servicios') }
                                ]);
                            }); } },
                            { label: 'Ver otro servicio', onClick: () => handleIntent('servicios') },
                            { label: 'Volver al menú', onClick: () => showMainMenu() }
                        ]);
                    }); } },
                    { label: 'Análisis de Datos', onClick: () => { pushUser('Análisis de Datos'); pushBot('📊 **Análisis de Datos**\n\nEs el servicio de procesamiento y análisis de información para extraer insights valiosos. Incluye:\n\n• Recolección y limpieza de datos\n• Análisis estadístico descriptivo\n• Identificación de patrones y tendencias\n• Elaboración de informes ejecutivos\n• Recomendaciones basadas en datos\n\nIdeal para empresas que quieren entender mejor su negocio y tomar decisiones informadas. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                        setQuickButtons([
                            { label: 'Sí, ir al formulario', onClick: () => { pushUser('Sí, ir al formulario'); pushBot('¡Perfecto! Te voy a redirigir al formulario de ciencia de datos. Allí podrás detallar tus necesidades de análisis, fuentes de información y objetivos de negocio.\n\nTe redirijo al formulario de ciencia de datos...').then(() => {
                                setQuickButtons([
                                    { label: 'Formulario', onClick: () => { pushUser('Formulario'); pushBot('Abriendo el formulario de ciencia de datos...'); go(LINKS.datos); } },
                                    { label: 'Prefiero hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                                    { label: 'Volver', onClick: () => handleIntent('servicios') }
                                ]);
                            }); } },
                            { label: 'Ver otro servicio', onClick: () => handleIntent('servicios') },
                            { label: 'Volver al menú', onClick: () => showMainMenu() }
                        ]);
                    }); } },
                    { label: 'Ver todos los servicios', onClick: () => handleMoreServices() },
                    { label: 'Volver al menú', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'rubros') {
            pushUser('Rubros con los que trabajan');
            pushBot('Trabajamos con marcas y negocios que quieren crecer con estrategia y datos. Algunos rubros con los que tenemos experiencia: Salud, Gastronomía, Retail, Servicios profesionales, Educación, Turismo. ¿De qué rubro es tu negocio?').then(() => {
                setQuickButtons([
                    { label: 'Salud', onClick: () => { pushUser('Salud'); pushBot('Entendido. Podemos ayudarte con marketing para clínicas y consultorios.'); } },
                    { label: 'Gastronomía', onClick: () => { pushUser('Gastronomía'); pushBot('Perfecto. Tenemos experiencia en marketing para restaurantes y food delivery.'); } },
                    { label: 'Retail', onClick: () => { pushUser('Retail'); pushBot('Excelente. Podemos impulsar tus ventas online y locales físicos.'); } },
                    { label: 'Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'precios') {
            pushUser('Precios de presupuestos');
            pushBot('El precio depende de lo que necesites y del alcance del proyecto. Para poder cotizarte correctamente, primero completá el formulario del servicio que te interesa y con esa información te enviamos el presupuesto.').then(() => {
                setQuickButtons([
                    { label: 'Formulario Publicidad y Marketing', onClick: () => { pushUser('Formulario Publicidad y Marketing'); pushBot('Te redirijo al formulario de publicidad y marketing...'); } },
                    { label: 'Formulario Desarrollo Web', onClick: () => { pushUser('Formulario Desarrollo Web'); pushBot('Te redirijo al formulario de desarrollo web...'); } },
                    { label: 'Formulario Ciencia de Datos', onClick: () => { pushUser('Formulario Ciencia de Datos'); pushBot('Te redirijo al formulario de ciencia de datos...'); } },
                    { label: 'Hablar con un experto', onClick: () => handleIntent('contacto') },
                    { label: 'Volver al menú', onClick: () => showMainMenu() }
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
        
        // Simple response for text input
        setTimeout(() => {
            pushBot('Recibí tu mensaje. Para ayudarte mejor, elegí una opción del menú o contactanos por WhatsApp.');
            showMainMenu();
        }, 1000);
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
        pushBot('¡Hola! Soy Loyca. ¿En qué te puedo ayudar?').then(() => {
            showMainMenu();
        });
    }

    console.log('Chatbot initialized successfully');
});
