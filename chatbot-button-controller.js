// Controlador avanzado para botones del chatbot - VERSIÓN ESTÁTICA
class ChatbotButtonController {
    constructor() {
        this.init();
    }

    init() {
        console.log('ChatbotButtonController inicializado en modo estático');
    }

    ensureUniformSize() {
        return;
    }
}

// Inicializar el controlador cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.chatbotButtonController = new ChatbotButtonController();
    
    // Asegurar tamaños uniformes después de un pequeño retraso
    setTimeout(() => {
        window.chatbotButtonController.ensureUniformSize();
    }, 100);
});

// También inicializar si ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.chatbotButtonController = new ChatbotButtonController();
        setTimeout(() => {
            window.chatbotButtonController.ensureUniformSize();
        }, 100);
    });
} else {
    window.chatbotButtonController = new ChatbotButtonController();
    setTimeout(() => {
        window.chatbotButtonController.ensureUniformSize();
    }, 100);
}
