// Flujo conversacional Loyca - Sin programación de citas
let conversationFlow = null;

function startConversationFlow() {
    conversationFlow = {
        step: 'service',
        service: null,
        industry: null,
        needs: null
    };
    
    pushBot('¡Perfecto! Para ayudarte mejor, primero contame ¿qué servicio te interesa?');
    
    setQuickButtons([
        { label: '📢 Publicidad y Marketing', onClick: () => selectService('publicidad') },
        { label: '💻 Desarrollo Web', onClick: () => selectService('web') },
        { label: '📊 Ciencia de Datos', onClick: () => selectService('datos') },
        { label: '❌ Salir', onClick: () => cancelFlow() }
    ]);
}

function selectService(service) {
    if (!conversationFlow) return;
    
    conversationFlow.service = service;
    const serviceName = service === 'publicidad' ? 'Publicidad y Marketing' : 
                       service === 'web' ? 'Desarrollo Web' : 'Ciencia de Datos';
    
    pushUser(`Me interesa: ${serviceName}`);
    pushBot('¡Excelente elección! Ahora contame un poco sobre tu rubro o tipo de negocio para adaptar la estrategia:');
    
    setQuickButtons([
        { label: '🏥 Salud / Estética', onClick: () => selectIndustry('salud') },
        { label: '🍽️ Gastronomía', onClick: () => selectIndustry('gastronomia') },
        { label: '🛍️ Retail / E-commerce', onClick: () => selectIndustry('retail') },
        { label: '💼 Servicios Profesionales', onClick: () => selectIndustry('servicios') },
        { label: '🏠 Inmobiliaria', onClick: () => selectIndustry('inmobiliaria') },
        { label: '📚 Educación', onClick: () => selectIndustry('educacion') },
        { label: '✈️ Turismo', onClick: () => selectIndustry('turismo') },
        { label: '💪 Fitness', onClick: () => selectIndustry('fitness') },
        { label: '📝 Otro rubro', onClick: () => { if (input) input.focus(); } },
        { label: '❌ Salir', onClick: () => cancelFlow() }
    ]);
}

function selectIndustry(industry) {
    if (!conversationFlow) return;
    
    const industryName = {
        'salud': 'Salud / Estética',
        'gastronomia': 'Gastronomía',
        'retail': 'Retail / E-commerce',
        'servicios': 'Servicios Profesionales',
        'inmobiliaria': 'Inmobiliaria',
        'educacion': 'Educación',
        'turismo': 'Turismo',
        'fitness': 'Fitness'
    };
    
    conversationFlow.industry = industry;
    pushUser(`Mi rubro: ${industryName[industry]}`);
    
    pushBot('Entendido. ¿Cuál es el principal objetivo o necesidad que querés resolver con nuestro servicio?');
    
    setQuickButtons([
        { label: '📈 Aumentar ventas', onClick: () => selectNeed('ventas') },
        { label: '👥 Conseguir más clientes', onClick: () => selectNeed('clientes') },
        { label: '🎯 Mejorar posicionamiento', onClick: () => selectNeed('posicionamiento') },
        { label: '🤖 Automatizar procesos', onClick: () => selectNeed('automatizacion') },
        { label: '📊 Analizar datos', onClick: () => selectNeed('analisis') },
        { label: '🌐 Crear presencia online', onClick: () => selectNeed('presencia') },
        { label: '💡 Optimizar estrategia', onClick: () => selectNeed('optimizacion') },
        { label: '📝 Otro objetivo', onClick: () => { if (input) input.focus(); } },
        { label: '❌ Salir', onClick: () => cancelFlow() }
    ]);
}

function selectNeed(need) {
    if (!conversationFlow) return;
    
    const needName = {
        'ventas': 'Aumentar ventas',
        'clientes': 'Conseguir más clientes',
        'posicionamiento': 'Mejorar posicionamiento',
        'automatizacion': 'Automatizar procesos',
        'analisis': 'Analizar datos',
        'presencia': 'Crear presencia online',
        'optimizacion': 'Optimizar estrategia'
    };
    
    conversationFlow.needs = need;
    pushUser(`Mi objetivo: ${needName[need]}`);
    
    // Generar respuesta personalizada según servicio y necesidad
    generatePersonalizedResponse();
}

function generatePersonalizedResponse() {
    if (!conversationFlow) return;
    
    const serviceName = conversationFlow.service === 'publicidad' ? 'Publicidad y Marketing' : 
                       conversationFlow.service === 'web' ? 'Desarrollo Web' : 'Ciencia de Datos';
    
    pushBot(`¡Perfecto! Basado en lo que me contás, te puedo ayudar de esta forma:\n\n` +
           `🔹 **Servicio**: ${serviceName}\n` +
           `🎯 **Objetivo**: ${conversationFlow.needs}\n\n` +
           `Para darte una cotización precisa, necesito que completes el formulario específico de este servicio.`);
    
    // Redirigir al formulario correspondiente
    const links = {
        'publicidad': `${isInFrontend ? '../' : ''}frontend/publicidad-redes.html#socialMediaForm`,
        'web': `${isInFrontend ? '../' : ''}frontend/ciencia-datos.html#webDevForm`,
        'datos': `${isInFrontend ? '../' : ''}frontend/ciencia-datos.html#kpiContactForm`
    };
    
    setQuickButtons([
        { label: '📝 Completar formulario', onClick: () => go(links[conversationFlow.service]) },
        { label: '💬 Hablar por WhatsApp', onClick: () => handleIntent('contacto') },
        { label: '❓ Otra consulta', onClick: () => { conversationFlow = null; showMainMenu(); } }
    ]);
}

function cancelFlow() {
    conversationFlow = null;
    pushBot('Entendido. ¿En qué más te puedo ayudar?');
    showMainMenu();
}

// Integrar con el sistema existente
function routeText(text) {
    const t = normalize(text);
    if (!t) return;

    // Detectar intención de conversación personalizada
    if (t.includes('ayuda') || t.includes('asesoramiento') || t.includes('consulta') || t.includes('necesito') || t.includes('quiero')) {
        startConversationFlow();
        return;
    }

    // Resto de las intenciones existentes...
    if (t.includes('precio') || t.includes('costo') || t.includes('presupuesto')) {
        handleIntent('precios');
        return;
    }
    
    if (t.includes('rubro') || t.includes('industria') || t.includes('sector')) {
        handleIntent('rubros');
        return;
    }
    
    if (t.includes('contacto') || t.includes('whatsapp') || t.includes('hablar')) {
        handleIntent('contacto');
        return;
    }
    
    if (t.includes('serv') || t.includes('marketing') || t.includes('publicidad') || t.includes('web') || t.includes('datos')) {
        handleIntent('servicios');
        return;
    }
    
    pushBot('Para ayudarte mejor, elegí una opción del menú o contame más sobre lo que necesitás.');
    showMainMenu();
}

// Actualizar menú principal
function showMainMenu() {
    setQuickButtons([
        { label: 'Servicios que ofrecen', onClick: () => handleIntent('servicios') },
        { label: 'Rubros con los que trabajan', onClick: () => handleIntent('rubros') },
        { label: 'Precios de presupuestos', onClick: () => handleIntent('precios') },
        { label: '💬 Asesoramiento personalizado', onClick: () => startConversationFlow() },
        { label: 'Quiero hablar con una persona', onClick: () => handleIntent('contacto') }
    ]);
}
