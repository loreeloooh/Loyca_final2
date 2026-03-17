// Controlador avanzado para botones del chatbot - VERSIÓN ESTÁTICA
class ChatbotButtonController {
    constructor() {
        this.init();
    }

    init() {
        // Versión estática - no ajusta dinámicamente los tamaños
        console.log('ChatbotButtonController inicializado en modo estático');
    }

    // Método para asegurar que todos los botones tengan el mismo tamaño
    ensureUniformSize() {
        const buttons = document.querySelectorAll('.chatbot-chip');
        
        buttons.forEach(button => {
            // Forzar altura fija más pequeña
            button.style.height = '28px';
            button.style.fontSize = '9px';
            button.style.lineHeight = '1';
            button.style.fontFamily = "'Poppins', sans-serif";
            button.style.whiteSpace = 'nowrap';
            button.style.overflow = 'hidden';
            button.style.textOverflow = 'ellipsis';
            button.style.padding = '4px 8px';
            button.style.borderRadius = '12px';
        });
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
