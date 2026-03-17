// Flujo de agendamiento para Loyca - Chatbot type WhatsApp
let bookingFlow = null;

function startBookingFlow() {
    bookingFlow = {
        step: 'service',
        service: null,
        date: null,
        time: null,
        contactInfo: null
    };
    
    pushBot('¡Perfecto! Para agendar tu asesoramiento personalizado, primero elegí el servicio que necesitás:');
    
    setQuickButtons([
        { label: '📢 Publicidad y Marketing', onClick: () => selectService('publicidad') },
        { label: '💻 Desarrollo Web', onClick: () => selectService('web') },
        { label: '📊 Ciencia de Datos', onClick: () => selectService('datos') },
        { label: '❌ Cancelar', onClick: () => cancelBooking() }
    ]);
}

function selectService(service) {
    if (!bookingFlow) return;
    
    bookingFlow.service = service;
    const serviceName = service === 'publicidad' ? 'Publicidad y Marketing' : 
                       service === 'web' ? 'Desarrollo Web' : 'Ciencia de Datos';
    
    pushUser(`Seleccioné: ${serviceName}`);
    pushBot('¡Excelente elección! Ahora necesito saber un poco más sobre tu proyecto para prepararnos mejor:');
    
    setQuickButtons([
        { label: '🏢 Soy una empresa', onClick: () => selectClientType('empresa') },
        { label: '👤 Soy independiente/freelance', onClick: () => selectClientType('independiente') },
        { label: '🚀 Estoy empezando', onClick: () => selectClientType('emprendedor') },
        { label: '❌ Cancelar', onClick: () => cancelBooking() }
    ]);
}

function selectClientType(type) {
    if (!bookingFlow) return;
    
    const typeText = type === 'empresa' ? 'Empresa' : 
                   type === 'independiente' ? 'Independiente/Freelance' : 'Emprendedor';
    
    pushUser(`Soy: ${typeText}`);
    pushBot('Perfecto. Ahora elegí la fecha y horario para tu asesoramiento:');
    
    setQuickButtons([
        { label: '📅 Mañana', onClick: () => selectDateOption('mañana') },
        { label: '📅 Esta semana', onClick: () => selectDateOption('semana') },
        { label: '📅 Próxima semana', onClick: () => selectDateOption('proxima_semana') },
        { label: '❌ Cancelar', onClick: () => cancelBooking() }
    ]);
}

function selectDateOption(option) {
    if (!bookingFlow) return;
    
    let dateStr;
    const today = new Date();
    
    switch(option) {
        case 'mañana':
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            dateStr = tomorrow.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
            break;
        case 'semana':
            const thisWeek = new Date(today);
            thisWeek.setDate(today.getDate() + 3);
            dateStr = thisWeek.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
            break;
        case 'proxima_semana':
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            dateStr = nextWeek.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
            break;
    }
    
    bookingFlow.date = dateStr;
    pushUser(`📅 Fecha: ${dateStr}`);
    
    pushBot('¡Perfecto! Ahora elegí el horario que mejor te convenga:');
    
    setQuickButtons([
        { label: '🌅 09:00 hs', onClick: () => selectTime('09:00') },
        { label: '☀️ 11:00 hs', onClick: () => selectTime('11:00') },
        { label: '🌤️ 14:00 hs', onClick: () => selectTime('14:00') },
        { label: '🌇 16:00 hs', onClick: () => selectTime('16:00') },
        { label: '❌ Cancelar', onClick: () => cancelBooking() }
    ]);
}

function selectTime(time) {
    if (!bookingFlow) return;
    
    bookingFlow.time = time;
    pushUser(`⏰ Horario: ${time} hs`);
    
    const serviceName = bookingFlow.service === 'publicidad' ? 'Publicidad y Marketing' : 
                       bookingFlow.service === 'web' ? 'Desarrollo Web' : 'Ciencia de Datos';
    
    pushBot(`📋 **Resumen de tu asesoramiento**\n\n` +
           `🔹 Servicio: ${serviceName}\n` +
           `📅 Fecha: ${bookingFlow.date}\n` +
           `⏰ Horario: ${time} hs\n\n` +
           `¿Confirmas esta reunión? Te enviaremos la información de conexión por WhatsApp.`);
    
    setQuickButtons([
        { label: '✅ Confirmar asesoramiento', onClick: () => confirmBooking() },
        { label: '❌ Cancelar', onClick: () => cancelBooking() }
    ]);
}

function confirmBooking() {
    if (!bookingFlow) return;
    
    pushUser('✅ Confirmo el asesoramiento');
    
    pushBot('🎉 **¡Excelente!** Tu asesoramiento ha sido agendado exitosamente.\n\n' +
           '📱 Te enviaremos un recordatorio con todos los detalles por WhatsApp 24 horas antes.\n\n' +
           '💡 Mientras tanto, podés preparar tus dudas y objetivos para aprovechar al máximo la reunión.\n\n' +
           '¿Hay algo más en lo que podamos ayudarte?');
    
    bookingFlow = null;
    showMainMenu();
}

function cancelBooking() {
    bookingFlow = null;
    pushBot('Entendido. Cancelamos el proceso de agendamiento. ¿En qué más te puedo ayudar?');
    showMainMenu();
}

// Integrar con el sistema existente
function routeText(text) {
    const t = normalize(text);
    if (!t) return;

    // Detectar intención de agendar asesoramiento
    if (t.includes('agendar') || t.includes('asesoramiento') || t.includes('reunion') || t.includes('consulta') || t.includes('turno')) {
        startBookingFlow();
        return;
    }

    // Resto de las intenciones existentes...
    if (t.includes('precio') || t.includes('costo') || t.includes('presupuesto')) {
        handleIntent('precios');
        return;
    }
    
    // ... resto del código existente
}

// Actualizar menú principal
function showMainMenu() {
    setQuickButtons([
        { label: 'Servicios que ofrecen', onClick: () => handleIntent('servicios') },
        { label: 'Rubros con los que trabajan', onClick: () => handleIntent('rubros') },
        { label: 'Precios de presupuestos', onClick: () => handleIntent('precios') },
        { label: '📅 Agendar asesoramiento', onClick: () => startBookingFlow() },
        { label: 'Quiero hablar con una persona', onClick: () => handleIntent('contacto') }
    ]);
}
