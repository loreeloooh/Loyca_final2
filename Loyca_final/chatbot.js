document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing chatbot...');
(function() {
    const root = document.getElementById('loycaChatbot');
    const fab = document.getElementById('chatbotFab');
    const win = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const quick = document.getElementById('chatbotQuick');
    const form = document.getElementById('chatbotForm');
    const input = document.getElementById('chatbotText');

    console.log('Chatbot elements found:', {
        root: !!root,
        fab: !!fab,
        win: !!win,
        closeBtn: !!closeBtn,
        messages: !!messages,
        quick: !!quick,
        form: !!form,
        input: !!input
    });

    if (!root || !fab || !win || !closeBtn || !messages || !quick || !form || !input) {
        console.error('Missing chatbot elements');
        return;
    }

    console.log('All chatbot elements found');

    const WHATSAPP = 'https://wa.me/5493413138290';
    const STORAGE_KEY = 'loyca_chat_history_v1';
    const SESSION_KEY = 'loyca_chat_session';

    const isInFrontend = /\/frontend\//i.test(window.location.pathname.replace(/\\/g, '/'));
    const prefix = isInFrontend ? '../' : '';

    const LINKS = {
        publicidad: `${prefix}frontend/publicidad-redes.html#socialMediaForm`,
        datos: `${prefix}frontend/ciencia-datos.html#kpiContactForm`,
        web: `${prefix}frontend/desarrollo-web.html`
    };

    let history = [];
    let currentSession = null;
    
    // Verificar si es una nueva sesión del navegador
    function initializeSession() {
        try {
            currentSession = sessionStorage.getItem(SESSION_KEY);
            const lastActivity = sessionStorage.getItem('loyca_last_activity');
            const now = Date.now();
            
            // Si no hay sesión o la última actividad fue hace más de 5 minutos, considerar como nueva sesión
            if (!currentSession || !lastActivity || (now - parseInt(lastActivity)) > 300000) {
                // Nueva sesión - limpiar localStorage
                localStorage.removeItem(STORAGE_KEY);
                currentSession = Date.now().toString();
                sessionStorage.setItem(SESSION_KEY, currentSession);
                sessionStorage.setItem('loyca_last_activity', now.toString());
                console.log('Nueva sesión detectada - historial limpiado');
            } else {
                // Sesión existente - cargar historial y actualizar actividad
                history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                sessionStorage.setItem('loyca_last_activity', now.toString());
                console.log('Sesión existente - historial cargado:', history.length, 'mensajes');
            }
        } catch (e) {
            console.error('Error inicializando sesión:', e);
            history = [];
        }
    }
    
    initializeSession();

    function saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (e) {}
    }
    
    // Limpiar sesión cuando se cierra la ventana/pestaña
    function handleTabClose() {
        try {
            sessionStorage.removeItem(SESSION_KEY);
            console.log('Sesión finalizada - historial se limpiará en próxima apertura');
        } catch (e) {}
    }
    
    // Detectar cierre de pestaña/ventana - TEMPORALMENTE DESACTIVADO
    // window.addEventListener('beforeunload', (e) => {
    //     // Solo limpiar si el usuario está cerrando la pestaña/ventana
    //     // No limpiar en navegación interna o apertura de nuevas pestañas
    //     // Esperar un poco para diferenciar entre cierre real y apertura de nueva pestaña
    //     setTimeout(() => {
    //         handleTabClose();
    //     }, 0);
    // });
    
    // Mantener un heartbeat para detectar si el usuario sigue activo en el sitio
    let heartbeatInterval = setInterval(() => {
        try {
            const lastActivity = sessionStorage.getItem('loyca_last_activity');
            const now = Date.now();
            
            if (!lastActivity || (now - parseInt(lastActivity)) > 30000) {
                // Si no hay actividad por 30 segundos, actualizar la sesión
                sessionStorage.setItem('loyca_last_activity', now.toString());
            }
        } catch (e) {}
    }, 10000);
    
    // Actualizar actividad en cada interacción del usuario
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
            try {
                sessionStorage.setItem('loyca_last_activity', Date.now().toString());
            } catch (e) {}
        }, { passive: true });
    });

    function go(url) {
        console.log('go() llamado con URL:', url);
        
        // Guardar la URL en sessionStorage antes de redirigir
        sessionStorage.setItem('loyca_redirect_url', url);
        
        // Prevenir que se cierre el chatbot guardando el estado
        const wasOpen = root.classList.contains('is-open');
        console.log('Estado antes de abrir nueva pestaña - wasOpen:', wasOpen);
        console.log('Clases del root antes:', root.className);
        
        // Abrir en nueva pestaña para no cerrar el chatbot
        if (url.includes('#')) {
            const [page, anchor] = url.split('#');
            console.log('Abriendo nueva pestaña con ancla:', page + '#' + anchor);
            window.open(page + '#' + anchor, '_blank');
        } else {
            console.log('Abriendo nueva pestaña sin ancla:', url);
            window.open(url, '_blank');
        }
        
        // Asegurarse de que el chatbot permanezca abierto si estaba abierto
        setTimeout(() => {
            const isOpenNow = root.classList.contains('is-open');
            console.log('Estado después de abrir nueva pestaña - isOpenNow:', isOpenNow);
            console.log('Clases del root después:', root.className);
            
            if (wasOpen && !isOpenNow) {
                console.log('Chatbot se cerró, reabriendo...');
                root.classList.add('is-open');
                console.log('Chatbot reabierto. Clases después de reabrir:', root.className);
            }
        }, 200);
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

    function setQuickButtons(buttons) {
        quick.innerHTML = '';
        quick.style.display = buttons.length ? 'grid' : 'none';
        
        // Agregar clase para grid de 3 columnas si hay más de 4 botones
        if (buttons.length > 4) {
            quick.classList.add('grid-3-columns');
        } else {
            quick.classList.remove('grid-3-columns');
        }
        
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
        console.log('closeChat() llamado - cerrando chatbot');
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
        pushBot('Aquí tienes nuestras principales opciones:\n\n¿Qué servicio específico te interesa?').then(() => {
            setQuickButtons([
                { label: 'Meta Ads', onClick: () => { pushUser('Meta Ads'); pushBot('📱 **Meta Ads (Facebook/Instagram Ads)**\n\nEs la publicidad pagada en la plataforma de Meta. Incluye:\n\n• Creación de campañas publicitarias\n• Segmentación avanzada de audiencia\n• Diseño de creativos publicitarios\n• Monitoreo y optimización de resultados\n• Reportes de rendimiento detallados\n\nPerfecto para empresas que quieren alcanzar clientes potenciales específicos y aumentar ventas rápidamente. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de publicidad en una nueva pestaña...').then(() => {
                            setTimeout(() => go(LINKS.publicidad), 800);
                        });
                    }},
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Tiendas E-commerce', onClick: () => { pushUser('Tiendas E-commerce'); pushBot('🛒 **Tiendas E-commerce**\n\nEs el desarrollo de tiendas online completas con sistema de pagos. Incluye:\n\n• Catálogo de productos con fotos\n• Carrito de compras y checkout\n• Integración con pasarelas de pago\n• Panel de administración de productos\n• Sistema de envíos y tracking\n\nIdeal para empresas que quieren vender sus productos online 24/7. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de desarrollo web en una nueva pestaña...').then(() => {
                            setTimeout(() => go(LINKS.web), 800);
                        });
                    }},
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'SEO y Posicionamiento', onClick: () => { pushUser('SEO y Posicionamiento'); pushBot('🔍 **SEO y Posicionamiento Web**\n\nEs la optimización de tu sitio web para aparecer en los primeros resultados de Google. Incluye:\n\n• Análisis de palabras clave\n• Optimización on-page y técnica\n• Creación de contenido SEO friendly\n• Link building y estrategia de backlinks\n• Monitoreo de rankings y analytics\n\nPerfecto para empresas que quieren aumentar su visibilidad orgánica y atraer tráfico calificado. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de desarrollo web en una nueva pestaña...').then(() => {
                            setTimeout(() => go(LINKS.web), 800);
                        });
                    }},
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Análisis Predictivo', onClick: () => { pushUser('Análisis Predictivo'); pushBot('📈 **Análisis Predictivo**\n\nEs el uso de algoritmos de machine learning para predecir tendencias y comportamientos. Incluye:\n\n• Modelos predictivos personalizados\n• Análisis de patrones de comportamiento\n• Forecasting de ventas y demanda\n• Identificación de oportunidades de mercado\n• Dashboard con predicciones en tiempo real\n\nIdeal para empresas que quieren anticipar tendencias y tomar decisiones proactivas basadas en datos. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de ciencia de datos...').then(() => {
                            setTimeout(() => go(LINKS.datos), 1500);
                        });
                    }},
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Gestión de Redes', onClick: () => { pushUser('Gestión de Redes'); pushBot('📱 **Gestión de Redes Sociales**\n\nEs el servicio completo de administración y optimización de tus perfiles sociales. Incluye:\n\n• Creación y programación de contenido\n• Gestión de community management\n• Monitoreo de métricas y analytics\n• Interacción con tu comunidad\n• Estrategias de crecimiento\n\nIdeal para empresas que quieren mantener presencia activa en redes sin dedicar tiempo interno. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de publicidad en una nueva pestaña...').then(() => {
                            setTimeout(() => go(LINKS.publicidad), 800);
                        });
                    }},
                        { label: 'Ver otro servicio', onClick: () => handleMoreServices() },
                        { label: 'Volver a servicios', onClick: () => handleIntent('servicios') }
                    ]);
                }); } },
                { label: 'Sitios Web', onClick: () => { pushUser('Sitios Web'); pushBot('💻 **Sitios Web Corporativos**\n\nEs el desarrollo de páginas web profesionales para empresas. Incluye:\n\n• Diseño web moderno y responsive\n• Optimización para móviles y tablets\n• SEO básico para mejor posicionamiento\n• Integración con redes sociales\n• Panel de administración fácil\n\nPerfecto para empresas que necesitan una presencia digital profesional y confiable. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                    setQuickButtons([
                        { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de desarrollo web en una nueva pestaña...').then(() => {
                            setTimeout(() => go(LINKS.web), 800);
                        });
                    }},
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
            pushBot('En Loyca trabajamos con marcas que quieren crecer en el mundo digital.\n\nDesarrollamos estrategias de redes sociales, contenido y campañas publicitarias que ayudan a atraer audiencia, fortalecer la relación con los clientes y mejorar la presencia online de tu negocio.\n\nNos enfocamos en crear comunicación clara, contenido relevante y campañas que acompañen los objetivos de cada empresa.\n\n¿Te gustaría conocer más sobre algún servicio específico?').then(() => {
                setQuickButtons([
                    { label: 'Gestión de Redes Sociales', onClick: () => { pushUser('Gestión de Redes Sociales'); pushBot('📱 **Gestión de Redes Sociales**\n\nEs el servicio completo de administración y optimización de tus perfiles sociales. Incluye:\n\n• Creación y programación de contenido\n• Gestión de community management\n• Monitoreo de métricas y analytics\n• Interacción con tu comunidad\n• Estrategias de crecimiento\n\nIdeal para empresas que quieren mantener presencia activa en redes sin dedicar tiempo interno. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                        setQuickButtons([
                            { label: 'Formulario', onClick: () => { 
                            pushUser('Formulario'); 
                            pushBot('Abriendo el formulario de publicidad y redes sociales en una nueva pestaña...').then(() => {
                                setTimeout(() => go(LINKS.publicidad), 800);
                            });
                        }},
                            { label: 'Prefiero hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                            { label: 'Volver', onClick: () => handleIntent('servicios') }
                        ]);
                    }); } },
                    { label: 'Sitios Web Corporativos', onClick: () => { pushUser('Sitios Web Corporativos'); pushBot('💻 **Sitios Web Corporativos**\n\nEs el desarrollo de páginas web profesionales para empresas. Incluye:\n\n• Diseño web moderno y responsive\n• Optimización para móviles y tablets\n• SEO básico para mejor posicionamiento\n• Integración con redes sociales\n• Panel de administración fácil\n\nPerfecto para empresas que necesitan una presencia digital profesional y confiable. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                        setQuickButtons([
                            { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de desarrollo web en una nueva pestaña...').then(() => {
                            setTimeout(() => go(LINKS.web), 800);
                        });
                    }},
                            { label: 'Prefiero hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                            { label: 'Volver', onClick: () => handleIntent('servicios') }
                        ]);
                    }); } },
                    { label: 'Análisis de Datos', onClick: () => { pushUser('Análisis de Datos'); pushBot('📊 **Análisis de Datos**\n\nEs el servicio de procesamiento y análisis de información para extraer insights valiosos. Incluye:\n\n• Recolección y limpieza de datos\n• Análisis estadístico descriptivo\n• Identificación de patrones y tendencias\n• Elaboración de informes ejecutivos\n• Recomendaciones basadas en datos\n\nIdeal para empresas que quieren entender mejor su negocio y tomar decisiones informadas. ¿Te gustaría que te redirija al formulario para solicitar un presupuesto personalizado?').then(() => {
                        setQuickButtons([
                            { label: 'Formulario', onClick: () => { 
                        pushUser('Formulario'); 
                        pushBot('Abriendo el formulario de ciencia de datos...').then(() => {
                            setTimeout(() => go(LINKS.datos), 1500);
                        });
                    }},
                            { label: 'Prefiero hablar por WhatsApp', onClick: () => handleIntent('contacto') },
                            { label: 'Volver', onClick: () => handleIntent('servicios') }
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
                    { label: 'Salud', onClick: () => { 
                        pushUser('Salud'); 
                        pushBot('🏥 **Rubro Salud**\n\nTenemos amplia experiencia en el sector salud con:\n\n• Clínicas y consultorios privados\n• Farmacias y droguerías\n• Laboratorios médicos\n• Centros de estética y bienestar\n• Empresas de equipamiento médico\n• Seguros de salud\n\nAyudamos a mejorar la visibilidad online, captación de pacientes y comunicación efectiva en el sector salud.\n\n¿Te interesa algún servicio en particular o prefieres hablar con un asesor?').then(() => {
                            setQuickButtons([
                                { label: 'Servicios', onClick: () => { 
                                    pushUser('Servicios'); 
                                    pushBot('🏥 **Servicios para Salud**\n\n**Desarrollo Web:**\n• Sistema de turnos online\n• Historia clínica digital\n• Telemedicina integrada\n• Portal de pacientes\n\n**Publicidad Digital:**\n• Campañas de salud preventiva\n• Marketing médico ético\n• Educación sanitaria\n• Fidelización de pacientes\n\n**Ciencia de Datos:**\n• Análisis de tratamientos\n• Gestión de camas\n• Predicción de demandas\n• Optimización de recursos\n\n¿Qué servicio te interesa conocer más a fondo?').then(() => {
                                        setQuickButtons([
                                            { label: 'Desarrollo Web', onClick: () => { 
                                                pushUser('Desarrollo Web'); 
                                                pushBot('💻 **Desarrollo Web para Salud**\n\nPlataformas digitales que mejoran la atención:\n\n• **Sistema de Turnos Online** - Agenda 24/7 sin filas\n• **Historia Clínica Digital** - Acceso seguro desde cualquier lugar\n• **Telemedicina** - Consultas virtuales con video\n• **Portal de Pacientes** - Resultados y recetas online\n\n¿Te gustaría ver una demo o completar el formulario?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Ver Demo', onClick: () => pushBot('💻 **Lo que podemos hacer para tu clínica:**\n\n**Sistema de Turnos:**\n• Calendario médico especializado\n• Recordatorios automáticos SMS/WhatsApp\n• Gestión de sobreturnos\n• Integración con obras sociales\n\n**Historia Clínica:**\n• Backups automáticos y seguros\n• Acceso por niveles de permiso\n• Compartir con especialistas\n• Historial completo de tratamientos\n\n**Telemedicina:**\n• Video llamadas seguras HIPAA\n• Diagnóstico a distancia\n• Recetas digitales\n• Seguimiento post-consulta\n\n¿Querés un formulario, hablar con un asesor o volver?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Formulario', onClick: () => { 
                                                            pushUser('Formulario'); 
                                                            pushBot('Te redirijo al formulario de desarrollo web...').then(() => {
                                                                setTimeout(() => go(LINKS.web), 800);
                                                            });
                                                        }},
                                                        { label: 'Hablar con asesor', onClick: () => handleIntent('contacto') },
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                }) },
                                                        { label: 'Formulario', onClick: () => { 
                                                            pushUser('Formulario'); 
                                                            pushBot('Te redirijo al formulario de desarrollo web...').then(() => {
                                                                setTimeout(() => go(LINKS.web), 800);
                                                            });
                                                        }},
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                });
                                            }},
                                            { label: 'Publicidad', onClick: () => { 
                                                pushUser('Publicidad'); 
                                                pushBot('📱 **Publicidad para Salud**\n\nComunicación responsable y efectiva:\n\n• **Campañas Preventivas** - Chequeos y vacunas\n• **Marketing Médico Ético** - Sin promesas falsas\n• **Educación Sanitaria** - Contenido de valor\n• **Fidelización** - Programas de bienestar\n\n¿Querés ver casos de éxito o hablar con un asesor?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Casos de éxito', onClick: () => pushBot('📱 **¿Te gustaría ver nuestros casos de éxito de publicidad para clínicas?**\n\nTenemos excelentes ejemplos de cómo hemos ayudado a centros médicos a:\n\n• Aumentar un 40% las consultas preventivas\n• Llenar agendas de chequeos anuales\n• Promocionar servicios especializados\n• Educar a pacientes sobre salud preventiva\n\n¿Querés que te redirija a nuestro formulario para analizar tu caso específico?').then(() => {
                                                            setQuickButtons([
                                                                { label: 'Sí, redirigir al formulario', onClick: () => { 
                                                                    pushUser('Sí, redirigir al formulario'); 
                                                                    pushBot('Perfecto, te redirijo al formulario de publicidad...').then(() => {
                                                                        setTimeout(() => go(LINKS.publicidad), 800);
                                                                    });
                                                                }},
                                                                { label: 'Ver más información', onClick: () => pushBot('📱 **Lo que podemos hacer con publicidad para tu clínica:**\n\n**Campañas Preventivas:**\n• Recordatorios de chequeos anuales\n• Campañas de vacunación\n• Días de salud gratuita\n• Webinars médicos educativos\n\n**Marketing Ético:**\n• Presentación de especialistas\n• Instalaciones y tecnología\n• Testimonios reales de pacientes\n• Información de servicios cubiertos\n\n**Educación Sanitaria:**\n• Blog con consejos médicos\n• Videos de prevención\n• Infografías de salud\n• Newsletter mensual\n\n¿Querés un formulario, hablar con un asesor o volver?').then(() => {
                                                                    setQuickButtons([
                                                                        { label: 'Formulario', onClick: () => { 
                                                                            pushUser('Formulario'); 
                                                                            pushBot('Te redirijo al formulario de publicidad...').then(() => {
                                                                                setTimeout(() => go(LINKS.publicidad), 800);
                                                                            });
                                                                        }},
                                                                        { label: 'Hablar con asesor', onClick: () => handleIntent('contacto') },
                                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                                    ]);
                                                                })},
                                                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                            ]);
                                                        }) },
                                                        { label: 'Hablar con asesor', onClick: () => handleIntent('contacto') },
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                });
                                            }},
                                            { label: 'Datos', onClick: () => { 
                                                pushUser('Datos'); 
                                                pushBot('📊 **Datos para Salud**\n\nDecisiones basadas en evidencia:\n\n• **Análisis de Tratamientos** - Efectividad y costos\n• **Gestión de Camas** - Ocupación optimizada\n• **Predicción de Demandas** - Temporadas de alta\n• **Optimización de Recursos** - Personal e insumos\n\n¿Te gustaría una consulta gratuita de datos?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Consulta gratuita', onClick: () => handleIntent('contacto') },
                                                        { label: 'Formulario', onClick: () => { 
                                                            pushUser('Formulario'); 
                                                            pushBot('Te redirijo al formulario de ciencia de datos...').then(() => {
                                                                setTimeout(() => go(LINKS.datos), 1500);
                                                            });
                                                        }},
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                });
                                            }},
                                            { label: 'Volver', onClick: () => handleIntent('rubros') }
                                        ]);
                                    });
                                }},
                                { label: 'Hablar con asesor', onClick: () => handleIntent('contacto') },
                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                            ]);
                        });
                    }},
                    { label: 'Gastronomía', onClick: () => { 
                        pushUser('Gastronomía'); 
                        pushBot('🍽️ **Rubro Gastronomía**\n\nEspecializados en el sector gastronómico con:\n\n• Restaurantes y bares\n• Cafeterías y locales de comida rápida\n• Catering y servicios de banquetes\n• Empresas de alimentos y bebidas\n• Delivery y apps de comida\n• Productores alimenticios\n\nImpulsamos reservas, delivery online y presencia digital para negocios de comida.\n\n¿Te interesa algún servicio en particular o prefieres hablar con un asesor?').then(() => {
                            setQuickButtons([
                                { label: 'Servicios', onClick: () => { 
                                    pushUser('Servicios'); 
                                    pushBot('🍽️ **Servicios para Gastronomía**\n\n**Desarrollo Web:**\n• Sistema de reservas online\n• Menú digital e interactivo\n• Apps de delivery propias\n• Gestión de mesas y turnos\n\n**Publicidad Digital:**\n• Campañas en redes sociales\n• Marketing para foodies\n• Promociones geolocalizadas\n• Influencers gastronómicos\n\n**Ciencia de Datos:**\n• Análisis de preferencias de clientes\n• Optimización de inventario\n• Predicción de demanda\n• Segmentación de clientes\n\n¿Qué servicio te interesa conocer más a fondo?').then(() => {
                                        setQuickButtons([
                                            { label: 'Desarrollo Web', onClick: () => { 
                                                pushUser('Desarrollo Web'); 
                                                pushBot('💻 **Desarrollo Web para Gastronomía**\n\nCreamos plataformas digitales que transforman tu negocio:\n\n• **Sistema de reservas online** - Reduce llamadas y no-shows\n• **Menú digital QR** - Actualizable en tiempo real\n• **App de delivery propia** - Sin comisiones externas\n• **Gestión de mesas** - Optimiza capacidad y turnos\n• **Pedidos online** - Integrado con cocina\n\n¿Te gustaría ver una demo o completar el formulario?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Ver Demo', onClick: () => pushBot('💻 **Lo que podemos hacer para tu restaurante:**\n\n**Sistema de Reservas Online:**\n• Calendario en tiempo real de disponibilidad\n• Confirmaciones automáticas por WhatsApp/email\n• Reducción de no-shows con recordatorios\n• Gestión de capacidad máxima por turno\n\n**Menú Digital QR:**\n• Códigos QR en cada mesa\n• Menú actualizable instantáneamente\n• Fotos HD de cada plato\n• Información nutricional y alérgenos\n\n**App de Delivery Propia:**\n• Sin comisiones de terceros (15-30% de ahorro)\n• Programa de lealtad integrado\n• Pedidos programados\n• Seguimiento GPS en tiempo real\n\n**Gestión Integral:**\n• Control de stock desde cocina\n• Análisis de platos más vendidos\n• Integración con sistemas de pago\n• Reportes diarios de ventas\n\n¿Te gustaría iniciar con una consulta gratuita?') },
                                                        { label: 'Formulario', onClick: () => { 
                                                            pushUser('Formulario'); 
                                                            pushBot('Te redirijo al formulario de desarrollo web...').then(() => {
                                                                setTimeout(() => go(LINKS.web), 800);
                                                            });
                                                        }},
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                });
                                            }},
                                            { label: 'Publicidad', onClick: () => { 
                                                pushUser('Publicidad'); 
                                                pushBot('📱 **Publicidad para Gastronomía**\n\nLlegamos a más clientes hambrientos:\n\n• **Campañas en Instagram/Facebook** - Fotos apetitosas\n• **Marketing para foodies** - Community management\n• **Promociones geolocalizadas** - Atrae clientes cercanos\n• **Influencers gastronómicos** - Reseñas auténticas\n• **Email marketing** - Promociones para clientes frecuentes\n\n¿Querés ver casos de éxito o hablar con un asesor?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Casos de éxito', onClick: () => pushBot('📱 **Lo que podemos hacer con publicidad para tu restaurante:**\n\n**Campañas en Redes Sociales:**\n• Creación de contenido visual apetitoso\n• Videos cortos de platos signature\n• Stories con promociones del día\n• Publicidad dirigida por radio de 5km\n\n**Marketing para Foodies:**\n• Identificación de influencers locales\n• Organización de eventos de degustación\n• Creación de challenges virales\n• Colaboraciones con food bloggers\n\n**Promociones Geolocalizadas:**\n• Anuncios para gente cerca del local\n• Descuentos por hora pico (2-6pm)\n• Campañas "hoy en tu zona"\n• Retargeting de visitantes anteriores\n\n**Email Marketing:**\n• Newsletter semanal con novedades\n• Promos exclusivas para suscriptores\n• Recordatorios de cumpleaños\n• Encuestas de satisfacción\n\n¿Querés empezar con una campaña de prueba?') },
                                                        { label: 'Hablar con asesor', onClick: () => handleIntent('contacto') },
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                });
                                            }},
                                            { label: 'Datos', onClick: () => { 
                                                pushUser('Datos'); 
                                                pushBot('📊 **Datos para Gastronomía**\n\nDecisiones inteligentes para tu negocio:\n\n• **Análisis de preferencias** - Platos más vendidos\n• **Optimización de inventario** - Reduce desperdicios\n• **Predicción de demanda** - Prepara mejor los picos\n• **Segmentación** - Conoce a tus clientes\n• **Análisis de horarios** - Optimiza personal\n\n¿Te gustaría una consulta gratuita de datos?').then(() => {
                                                    setQuickButtons([
                                                        { label: 'Consulta gratuita', onClick: () => handleIntent('contacto') },
                                                        { label: 'Formulario', onClick: () => { 
                                                            pushUser('Formulario'); 
                                                            pushBot('Te redirijo al formulario de ciencia de datos...').then(() => {
                                                                setTimeout(() => go(LINKS.datos), 1500);
                                                            });
                                                        }},
                                                        { label: 'Volver', onClick: () => handleIntent('rubros') }
                                                    ]);
                                                });
                                            }},
                                            { label: 'Volver', onClick: () => handleIntent('rubros') }
                                        ]);
                                    });
                                }},
                                { label: 'Hablar con asesor', onClick: () => handleIntent('contacto') },
                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                            ]);
                        });
                    }},
                    { label: 'Retail', onClick: () => { 
                        pushUser('Retail'); 
                        pushBot('🛍️ **Rubro Retail**\n\nExpertos en comercio minorista con:\n\n• Tiendas de ropa y accesorios\n• Supermercados y minimercados\n• Tiendas de electrónica y tecnología\n• Negocios de hogar y decoración\n• Librerías y papelerías\n• Tiendas de regalos y novedades\n\nDesarrollamos e-commerce, gestión de redes y estrategias de venta online.\n\n¿Te interesa algún servicio en particular o prefieres hablar con un asesor?').then(() => {
                            setQuickButtons([
                                { label: 'Formulario', onClick: () => { 
                                    pushUser('Formulario'); 
                                    pushBot('Te redirijo al formulario para el sector retail...').then(() => {
                                        setTimeout(() => go(LINKS.publicidad + '?rubro=retail'), 1500);
                                    });
                                }},
                                { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                            ]);
                        });
                    }},
                    { label: 'Profesionales', onClick: () => { 
                        pushUser('Profesionales'); 
                        pushBot('💼 **Rubro Servicios Profesionales**\n\nTrabajamos con profesionales y consultoras:\n\n• Estudios de abogados y notarías\n• Consultoras de negocio\n• Estudios contables e impositivos\n• Arquitectos y diseñadores\n• Agencias de marketing digital\n• Consultores IT y tecnológicos\n\nPotenciamos tu marca personal y captación de clientes profesionales.\n\n¿Te gustaría que te contactemos o prefieres completar un formulario?').then(() => {
                            setQuickButtons([
                                { label: 'Formulario', onClick: () => { 
                                    pushUser('Formulario'); 
                                    pushBot('Te redirijo al formulario para servicios profesionales...').then(() => {
                                        setTimeout(() => go(LINKS.publicidad + '?rubro=servicios_profesionales'), 1500);
                                    });
                                }},
                                { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                            ]);
                        });
                    }},
                    { label: 'Educación', onClick: () => { 
                        pushUser('Educación'); 
                        pushBot('🎓 **Rubro Educación**\n\nEspecializados en el sector educativo con:\n\n• Academias y centros de estudio\n• Escuelas de idiomas\n• Institutos técnicos y profesionales\n• Plataformas de educación online\n• Consultoras educativas\n• Servicios de tutorías\n\nPotenciamos la matrícula, presencia digital y comunicación con estudiantes.\n\n¿Qué servicios te gustaría saber de esto? ¿Desarrollo web, publicidad o datos? ¿O deseas asesoramiento general?').then(() => {
                            setQuickButtons([
                                { label: 'Desarrollo Web', onClick: () => { 
                                    pushUser('Desarrollo Web'); 
                                    pushBot('Te redirijo al formulario de desarrollo web para el sector educación...').then(() => {
                                        setTimeout(() => go(LINKS.web), 800);
                                    });
                                }},
                                { label: 'Publicidad', onClick: () => { 
                                    pushUser('Publicidad'); 
                                    pushBot('Te redirijo al formulario de publicidad para el sector educación...').then(() => {
                                        setTimeout(() => go(LINKS.publicidad + '?rubro=educacion'), 1500);
                                    });
                                }},
                                { label: 'Datos', onClick: () => { 
                                    pushUser('Datos'); 
                                    pushBot('Te redirijo al formulario de ciencia de datos para el sector educación...').then(() => {
                                        setTimeout(() => go(LINKS.datos), 1500);
                                    });
                                }},
                                { label: 'Asesoramiento', onClick: () => handleIntent('contacto') },
                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                            ]);
                        });
                    }},
                    { label: 'Turismo', onClick: () => { 
                        pushUser('Turismo'); 
                        pushBot('✈️ **Rubro Turismo**\n\nExpertos en el sector turístico con:\n\n• Agencias de viajes\n• Hoteles y alojamientos\n• Restaurantes turísticos\n• Operadores turísticos\n• Empresas de transporte\n• Actividades y excursiones\n\nImpulsamos reservas online, visibilidad y promoción de destinos turísticos.\n\n¿Te gustaría que te contactemos o prefieres completar un formulario?').then(() => {
                            setQuickButtons([
                                { label: 'Formulario', onClick: () => { 
                                    pushUser('Formulario'); 
                                    pushBot('Te redirijo al formulario para el sector turismo...').then(() => {
                                        setTimeout(() => go(LINKS.publicidad + '?rubro=turismo'), 1500);
                                    });
                                }},
                                { label: 'WhatsApp', onClick: () => handleIntent('contacto') },
                                { label: 'Volver', onClick: () => handleIntent('rubros') }
                            ]);
                        });
                    }},
                    { label: 'Volver', onClick: () => showMainMenu() }
                ]);
            });
            return;
        }

        if (intent === 'precios') {
            pushUser('Precios de presupuestos');
            pushBot('El precio depende de lo que necesites y del alcance del proyecto. Para poder cotizarte correctamente, primero completá el formulario del servicio que te interesa y con esa información te enviamos el presupuesto.').then(() => {
                setQuickButtons([
                    { label: 'Formulario Publicidad', onClick: () => { 
                        pushUser('Formulario Publicidad'); 
                        pushBot('Te redirijo al formulario de publicidad y marketing...').then(() => {
                            setTimeout(() => go(LINKS.publicidad), 800);
                        });
                    }},
                    { label: 'Formulario Web', onClick: () => { 
                        pushUser('Formulario Web'); 
                        pushBot('Te redirijo al formulario de desarrollo web...').then(() => {
                            setTimeout(() => go(LINKS.web), 800);
                        });
                    }},
                    { label: 'Formulario Datos', onClick: () => { 
                        pushUser('Formulario Datos'); 
                        pushBot('Te redirijo al formulario de ciencia de datos...').then(() => {
                            setTimeout(() => go(LINKS.datos), 1500);
                        });
                    }},
                    { label: 'Hablar con experto', onClick: () => handleIntent('contacto') },
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
        pushBot('¡Hola! Soy el asistente de Loyca. ¿En qué te puedo ayudar hoy?').then(() => {
            showMainMenu();
        });
    }

    try {
        // Limpiar el estado para que siempre muestre el FAB primero
        localStorage.removeItem('loyca_chat_open');
        if (localStorage.getItem('loyca_chat_open') === '1') {
            openChat();
        }
    } catch (e) {
    }
    
    // MUTATION OBSERVER PARA DETECTAR Y PREVENIR CIERRE INDESEADO
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                const wasOpen = mutation.oldValue && mutation.oldValue.includes('is-open');
                const isOpenNow = target.classList.contains('is-open');
                
                console.log('MutationObserver detectó cambio de clase:');
                console.log('- Valor anterior:', mutation.oldValue);
                console.log('- Valor actual:', target.className);
                console.log('- Estaba abierto:', wasOpen);
                console.log('- Está abierto ahora:', isOpenNow);
                
                // Si el chatbot estaba abierto y ahora no lo está, y no fue por closeChat()
                if (wasOpen && !isOpenNow && !window.isChatClosingManually) {
                    console.log('🚨 CIERRE INDESEADO DETECTADO - Reabriendo chatbot automáticamente');
                    target.classList.add('is-open');
                    
                    // Mostrar notificación al usuario
                    setTimeout(() => {
                        pushBot('⚠️ El chatbot se mantendrá abierto para tu comodidad.');
                    }, 500);
                }
            }
        });
    });
    
    // Configurar el observer para observar cambios en el atributo class
    observer.observe(root, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
    });
    
    // Variable global para controlar cierres manuales
    window.isChatClosingManually = false;
    
    // Modificar closeChat para indicar que es un cierre manual
    const originalCloseChat = closeChat;
    window.closeChat = function() {
        console.log('Cierre manual detectado');
        window.isChatClosingManually = true;
        originalCloseChat();
        setTimeout(() => {
            window.isChatClosingManually = false;
        }, 100);
    };
    
    console.log('MutationObserver configurado para proteger el chatbot');
    console.log('Chatbot initialized successfully');
})();
})();
