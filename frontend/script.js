// Carousel Functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const totalSlides = slides.length;

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Show current slide
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function changeSlide(direction) {
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    showSlide(currentSlide);
}

function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
}

// Auto-advance carousel
setInterval(() => {
    changeSlide(1);
}, 5000);

// ===================================
// SERVICIOS INTERACTIVOS - CAPA NEGRA DESLIZANTE
// ===================================
function initInteractiveServices() {
    const serviceItems = document.querySelectorAll('.service-item');
    
    serviceItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // No activar si se hace clic en el botón CONTRATAR
            if (e.target.classList.contains('service-cta')) {
                return;
            }
            
            // Cerrar otros servicios
            serviceItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle del servicio actual
            this.classList.toggle('active');
        });
    });
    
    // Cerrar servicios al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.service-item')) {
            serviceItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

function initScrollParticles() {
    const scrollParticles = document.getElementById('scrollParticles');
    if (!scrollParticles) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'scroll-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        scrollParticles.appendChild(particle);
    }

    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const particles = document.querySelectorAll('.scroll-particle');

        if (scrollTop > lastScrollTop) {
            particles.forEach((particle) => {
                if (Math.random() > 0.95) {
                    particle.classList.add('active');
                    setTimeout(() => {
                        particle.classList.remove('active');
                    }, 3000);
                }
            });
        }

        lastScrollTop = scrollTop;
    });

    const particles = document.querySelectorAll('.scroll-particle');
    particles.forEach((particle, index) => {
        setTimeout(() => {
            particle.classList.add('active');
            setTimeout(() => {
                particle.classList.remove('active');
            }, 3000);
        }, index * 100);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initInteractiveServices();
    initScrollParticles();
});

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

body.classList.add('dark-mode');
localStorage.setItem('theme', 'dark');

// Check for saved theme preference
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    });
}

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (!isExpanded) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation state based on scroll position
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Update active nav on scroll (only for pages with anchor links)
window.addEventListener('scroll', () => {
    if (document.querySelector('.nav-list a[href^="#"]')) {
        updateActiveNav();
    }
});

// Initialize active nav only on index page
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    updateActiveNav();
}

// Search functionality
const searchBar = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', () => {
    const searchTerm = searchBar.value.trim();
    if (searchTerm) {
        // Simple search implementation - you can enhance this
        alert(`Buscando: ${searchTerm}`);
        searchBar.value = '';
    }
});

searchBar.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const service = contactForm.querySelectorAll('input[type="text"]')[1].value;
        const message = contactForm.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !message) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        
        // Here you would normally send the data to a server
        alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
        contactForm.reset();
    });
}

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and other elements
document.querySelectorAll('.service-card, .stat, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Portfolio Filter Functionality
const portfolioSection = document.getElementById('portfolio');
const filterBtns = portfolioSection
    ? portfolioSection.querySelectorAll('.portfolio-filters .filter-btn[data-filter]')
    : [];
const portfolioItems = portfolioSection
    ? portfolioSection.querySelectorAll('.portfolio-item')
    : [];

Array.from(filterBtns).forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from portfolio filter buttons
        Array.from(filterBtns).forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        Array.from(portfolioItems).forEach(item => {
            if (filter === 'all' || item.getAttribute('data-category') === filter) {
                item.style.display = 'block';
                // Add animation
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 100);
            } else {
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
});

// Observe portfolio items and team members for animations
document.querySelectorAll('.portfolio-item, .team-member').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add hover effect to portfolio items
Array.from(portfolioItems).forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0) scale(1)';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const processInstagramEmbeds = () => {
        try {
            if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
                window.instgrm.Embeds.process();
            }
        } catch (err) {
        }
    };

    (function () {
        const modal = document.getElementById('serviceModal');
        if (!modal) return;

        const iconEl = document.getElementById('serviceModalIcon');
        const titleEl = document.getElementById('serviceModalTitle');
        const tagEl = document.getElementById('serviceModalTag');
        const bodyEl = document.getElementById('serviceModalBody');
        const ctaBtn = document.getElementById('serviceModalCta');

        const serviceInterestInput = document.querySelectorAll('.contact-form input[type="text"]')[1] || null;

        const services = {
            'social-media': {
                icon: '📱',
                title: 'Redes Sociales',
                tag: 'Community Manager',
                body: `
                    <div class="service-detail-body">
                        <p>Gestionamos tu presencia digital con enfoque estratégico y comercial, no solo operativo.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Estrategia de contenido alineada a tus objetivos comerciales</li>
                            <li>Definición de pilares de comunicación</li>
                            <li>Calendario mensual estratégico de posts e historias</li>
                            <li>Creación, diseño y programación de publicaciones</li>
                            <li>Gestión de comunidad e interacción profesional</li>
                            <li>Reporte trimestral con métricas y análisis de rendimiento</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Posicionamiento como referente en tu sector</li>
                            <li>Mayor confianza y autoridad profesional</li>
                            <li>Generación de oportunidades calificadas</li>
                            <li>Comunicación estratégica sin que tengas que ocuparte</li>
                        </ul>

                        <p><strong>Plataformas que gestionamos</strong></p>
                        <div class="certifications-grid" aria-label="Plataformas que gestionamos">
                            <div class="cert-flip" role="button" tabindex="0" aria-label="LinkedIn - Autoridad profesional y generación de oportunidades B2B">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <div class="platform-card">
                                            <img class="platform-card__logo" src="images/plataformas/linkedin.png" alt="LinkedIn">
                                            <span class="platform-card__name">LinkedIn</span>
                                            <span class="cert-hint">Tocar para ver enfoque</span>
                                        </div>
                                    </div>
                                    <div class="cert-flip-back">
                                        <div class="platform-card">
                                            <span class="platform-card__desc">Autoridad profesional y generación de oportunidades B2B</span>
                                            <span class="cert-hint">Tocar para volver</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="Instagram - Posicionamiento de marca y credibilidad">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <div class="platform-card">
                                            <img class="platform-card__logo" src="images/plataformas/instagram.png" alt="Instagram">
                                            <span class="platform-card__name">Instagram</span>
                                            <span class="cert-hint">Tocar para ver enfoque</span>
                                        </div>
                                    </div>
                                    <div class="cert-flip-back">
                                        <div class="platform-card">
                                            <span class="platform-card__desc">Posicionamiento de marca y credibilidad</span>
                                            <span class="cert-hint">Tocar para volver</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="TikTok - Alcance estratégico y visibilidad">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <div class="platform-card">
                                            <img class="platform-card__logo" src="images/plataformas/tiktok.png" alt="TikTok">
                                            <span class="platform-card__name">TikTok</span>
                                            <span class="cert-hint">Tocar para ver enfoque</span>
                                        </div>
                                    </div>
                                    <div class="cert-flip-back">
                                        <div class="platform-card">
                                            <span class="platform-card__desc">Alcance estratégico y visibilidad</span>
                                            <span class="cert-hint">Tocar para volver</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="YouTube - Contenido de valor y posicionamiento a largo plazo">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <div class="platform-card">
                                            <img class="platform-card__logo" src="images/plataformas/youtube_short.png" alt="YouTube">
                                            <span class="platform-card__name">YouTube</span>
                                            <span class="cert-hint">Tocar para ver enfoque</span>
                                        </div>
                                    </div>
                                    <div class="cert-flip-back">
                                        <div class="platform-card">
                                            <span class="platform-card__desc">Contenido de valor y posicionamiento a largo plazo</span>
                                            <span class="cert-hint">Tocar para volver</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="Facebook - Comunidad y soporte publicitario">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <div class="platform-card">
                                            <img class="platform-card__logo" src="images/plataformas/facebook.png" alt="Facebook">
                                            <span class="platform-card__name">Facebook</span>
                                            <span class="cert-hint">Tocar para ver enfoque</span>
                                        </div>
                                    </div>
                                    <div class="cert-flip-back">
                                        <div class="platform-card">
                                            <span class="platform-card__desc">Comunidad y soporte publicitario</span>
                                            <span class="cert-hint">Tocar para volver</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="X - Presencia y conversación sectorial">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <div class="platform-card">
                                            <img class="platform-card__logo" src="images/plataformas/x.png" alt="X">
                                            <span class="platform-card__name">X</span>
                                            <span class="cert-hint">Tocar para ver enfoque</span>
                                        </div>
                                    </div>
                                    <div class="cert-flip-back">
                                        <div class="platform-card">
                                            <span class="platform-card__desc">Presencia y conversación sectorial</span>
                                            <span class="cert-hint">Tocar para volver</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p>No replicamos el mismo contenido en todas las redes. Adaptamos la estrategia según el objetivo de cada plataforma.</p>
                    </div>
                `
            },
            'ads': {
                icon: '📣',
                title: 'Publicidad Digital',
                tag: 'Paid Media Manager',
                body: `
                    <div class="service-detail-body">
                        <p>Estrategia publicitaria basada en datos, optimización y rentabilidad.</p>
                        <p>Gestionamos campañas en Meta Ads y Google Ads con enfoque en captación de pacientes y crecimiento sostenible.</p>

                        <p><strong>Objetivo:</strong> generar consultas/turnos de calidad, no solo alcance.</p>

                        <p><strong>Certificaciones:</strong></p>
                        <p class="certifications-help">Tocá cada sello para ver el QR y verificar la certificación.</p>
                        <div class="certifications-grid" aria-label="Certificaciones y códigos QR">
                            <div class="cert-flip" role="button" tabindex="0" aria-label="Ver QR de Google Ads Display Certification">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_DISPLAY_CERTIFIED.png" alt="Google Ads Display Certification">
                                        <span class="cert-hint">Tocar para ver QR</span>
                                    </div>
                                    <div class="cert-flip-back">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_DISPLAY_CERTIFIED_QR.png" alt="QR de Google Ads Display Certification">
                                        <span class="cert-hint">Tocar para volver</span>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="Ver QR de Google Ads Measurement Certification">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_MEASUREMENT_CERTIFIED.png" alt="Google Ads Measurement Certification">
                                        <span class="cert-hint">Tocar para ver QR</span>
                                    </div>
                                    <div class="cert-flip-back">
                                        <img class="cert-face" src="images/certificados/GOOGLE%20ADS%20MEASUREMENT%20CERTIFIED_QR.png" alt="QR de Google Ads Measurement Certification">
                                        <span class="cert-hint">Tocar para volver</span>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="Ver QR de Google Analytics Certification">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_ANALITYCS_CERTIFIED.png" alt="Google Analytics Certification">
                                        <span class="cert-hint">Tocar para ver QR</span>
                                    </div>
                                    <div class="cert-flip-back">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_ANALITYCS_CERTIFIED_QR.png" alt="QR de Google Analytics Certification">
                                        <span class="cert-hint">Tocar para volver</span>
                                    </div>
                                </div>
                            </div>

                            <div class="cert-flip" role="button" tabindex="0" aria-label="Ver QR de Google Ads Search Certification">
                                <div class="cert-flip-inner">
                                    <div class="cert-flip-front">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_SERCH_CERTIFIED.png" alt="Google Ads Search Certification">
                                        <span class="cert-hint">Tocar para ver QR</span>
                                    </div>
                                    <div class="cert-flip-back">
                                        <img class="cert-face" src="images/certificados/GOOGLE_ADS_SERCH_CERTIFIED_QR.png" alt="QR de Google Ads Search Certification">
                                        <span class="cert-hint">Tocar para volver</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Análisis de mercado y competencia</li>
                            <li>Diseño de embudos de conversión</li>
                            <li>Configuración profesional de campañas</li>
                            <li>Segmentación estratégica avanzada</li>
                            <li>Optimización constante basada en métricas</li>
                            <li>Medición y análisis de conversiones</li>
                            <li>Reporte mensual con métricas, aprendizajes y próximos pasos</li>
                            <li>El presupuesto publicitario (inversión en anuncios) no está incluido</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Mejor retorno sobre inversión</li>
                            <li>Captación de pacientes de mayor valor</li>
                            <li>Escalabilidad publicitaria</li>
                            <li>Decisiones respaldadas por datos</li>
                        </ul>
                    </div>
                `
            },
            'branding': {
                icon: '✨',
                title: 'Identidad de Marca',
                tag: 'Branding',
                body: `
                    <div class="service-detail-body">
                        <p>Tu marca es un activo estratégico. La construimos para que comunique profesionalismo y diferenciación.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Diseño de logo</li>
                            <li>Logo animado</li>
                            <li>Rebranding estratégico</li>
                            <li>Paleta cromática profesional</li>
                            <li>Sistema tipográfico</li>
                            <li>Definición de tono y voz de marca</li>
                            <li>Manual de identidad</li>
                            <li>Piezas gráficas base</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Imagen sólida y coherente</li>
                            <li>Diferenciación en el sector médico-estético</li>
                            <li>Mayor recordación de marca</li>
                            <li>Posicionamiento premium</li>
                        </ul>
                    </div>
                `
            },
            'contenido': {
                icon: '📝',
                title: 'Creación de Contenido',
                tag: 'Content',
                body: `
                    <div class="service-detail-body">
                        <p>Contenido estratégico que educa, posiciona y convierte.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Ideas y planificación mensual</li>
                            <li>Guiones para reels y videos educativos</li>
                            <li>Copies persuasivos</li>
                            <li>Carruseles estratégicos</li>
                            <li>Contenido optimizado para cada plataforma</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Autoridad en tu especialidad</li>
                            <li>Mayor interacción de calidad</li>
                            <li>Diferenciación frente a la competencia</li>
                            <li>Conversión orgánica constante</li>
                        </ul>
                    </div>
                `
            },
            'diseno': {
                icon: '🎨',
                title: 'Diseño Gráfico',
                tag: 'Design',
                body: `
                    <div class="service-detail-body">
                        <p>La percepción visual influye directamente en la decisión del paciente.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Diseño de historias y carruseles</li>
                            <li>Flyers promocionales</li>
                            <li>Piezas para campañas publicitarias</li>
                            <li>Material para impresión</li>
                            <li>Adaptaciones gráficas para campañas digitales</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Imagen profesional consistente</li>
                            <li>Mayor impacto visual</li>
                            <li>Coherencia en todos los puntos de contacto</li>
                        </ul>
                    </div>
                `
            },
            'filmmaking': {
                icon: '🎬',
                title: 'Día de Filmación',
                tag: 'Film Making',
                body: `
                    <div class="service-detail-body">
                        <p>Producción audiovisual profesional para elevar la percepción de tu marca.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Planificación estratégica de contenidos</li>
                            <li>Guionado previo</li>
                            <li>Dirección y rodaje profesional</li>
                            <li>Dirección en cámara para profesionales</li>
                            <li>Material optimizado para reels, ads y web</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Imagen de alto nivel</li>
                            <li>Mayor retención y alcance</li>
                            <li>Contenido premium reutilizable</li>
                            <li>Diferenciación real en el mercado</li>
                        </ul>
                    </div>
                `
            },
            'website': {
                icon: '🌐',
                title: 'Website',
                tag: 'Developer',
                body: `
                    <div class="service-detail-body">
                        <p>Tu web es tu activo digital central y tu principal canal de conversión.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Estructura estratégica orientada a conversión</li>
                            <li>Redacción persuasiva</li>
                            <li>Diseño alineado a tu identidad</li>
                            <li>Integración con WhatsApp y formularios</li>
                            <li>Optimización SEO básica</li>
                            <li>Adaptación responsive</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Más consultas directas</li>
                            <li>Mayor confianza profesional</li>
                            <li>Canal propio independiente de redes</li>
                        </ul>
                    </div>
                `
            },
            'data': {
                icon: '📊',
                title: 'Análisis de Datos',
                tag: 'Data Analytics',
                body: `
                    <div class="service-detail-body">
                        <p>Lo que no se mide, no se optimiza.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Análisis integral de métricas digitales</li>
                            <li>Evaluación de embudos de conversión</li>
                            <li>Detección de fugas en procesos comerciales</li>
                            <li>Optimización de rutas de captación de pacientes</li>
                            <li>Identificación de oportunidades de mejora operativa</li>
                            <li>Reportes estratégicos con recomendaciones accionables</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Mayor eficiencia en la gestión</li>
                            <li>Reducción de pérdidas invisibles</li>
                            <li>Optimización de inversión publicitaria</li>
                            <li>Decisiones estratégicas basadas en datos reales</li>
                        </ul>
                    </div>
                `
            },
            'asistente-virtual': {
                icon: '🤖',
                title: 'Asistente Virtual',
                tag: 'Automatización',
                body: `
                    <div class="service-detail-body">
                        <p>Automatizamos tu atención para que no pierdas consultas y puedas convertir más, sin estar 24/7.</p>

                        <p><strong>¿Qué incluye?</strong></p>
                        <ul class="service-list includes-list">
                            <li>Recepción y respuesta automática de mensajes</li>
                            <li>Calificación de consultas (motivo, zona, disponibilidad, presupuesto, etc.)</li>
                            <li>Derivación a humano cuando hace falta</li>
                            <li>Creación de agenda para turnos o citas</li>
                            <li>Confirmaciones y recordatorios (para reducir ausencias)</li>
                            <li>Respuestas rápidas a preguntas frecuentes</li>
                        </ul>

                        <p><strong>¿En qué te beneficia?</strong></p>
                        <ul class="service-list benefits-list">
                            <li>Menos mensajes sin responder</li>
                            <li>Más turnos/citas agendados</li>
                            <li>Atención consistente y profesional</li>
                            <li>Más tiempo para enfocarte en tu negocio</li>
                        </ul>
                    </div>
                `
            }
        };

        let activeServiceId = null;
        let lastFocusEl = null;

        function openModal(serviceId) {
            const service = services[serviceId];
            if (!service) return;

            activeServiceId = serviceId;
            lastFocusEl = document.activeElement;

            if (iconEl) iconEl.textContent = service.icon || '';
            if (titleEl) titleEl.textContent = service.title || '';
            if (tagEl) tagEl.textContent = service.tag || '';
            if (bodyEl) bodyEl.innerHTML = service.body || '';
            initCertFlips(modal);

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            const closeBtn = modal.querySelector('[data-close="true"]');
            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            const toFocus = lastFocusEl;
            activeServiceId = null;
            lastFocusEl = null;
            if (toFocus && typeof toFocus.focus === 'function') toFocus.focus();
        }

        document.addEventListener('click', (e) => {
            const trigger = e.target && e.target.closest ? e.target.closest('.js-service-modal') : null;
            if (trigger) {
                e.preventDefault();
                openModal(trigger.getAttribute('data-service'));
                return;
            }

            const closeTrigger = e.target && e.target.closest ? e.target.closest('#serviceModal [data-close="true"]') : null;
            if (closeTrigger) {
                e.preventDefault();
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeModal();
        });

        if (ctaBtn) {
            ctaBtn.addEventListener('click', () => {
                if (activeServiceId && services[activeServiceId] && serviceInterestInput) {
                    serviceInterestInput.value = services[activeServiceId].title || '';
                }
                closeModal();

                const contact = document.querySelector('#contact');
                if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
    })();

    function initCertFlips(root) {
        const scope = root || document;
        scope.querySelectorAll('.cert-flip').forEach((card) => {
            if (card.dataset.certInit === '1') return;
            card.dataset.certInit = '1';

            card.addEventListener('click', () => {
                card.classList.toggle('is-flipped');
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.classList.toggle('is-flipped');
                }
            });
        });
    }

    initCertFlips(document);

    document.addEventListener('click', function(e) {
        const link = e.target && e.target.closest ? e.target.closest('.instagram-media a') : null;
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();
        alert('¡Gracias por ver nuestro trabajo! Contáctanos para proyectos similares.');
        return false;
    }, true);

    const lockInstagramEmbeds = () => {
        const instagramEmbeds = document.querySelectorAll('.instagram-media');

        instagramEmbeds.forEach(embed => {
            const instagramLinks = embed.querySelectorAll('a');
            instagramLinks.forEach(link => {
                if (link.dataset.igLocked === '1') return;
                link.dataset.igLocked = '1';

                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('¡Gracias por ver nuestro trabajo! Contáctanos para proyectos similares.');
                    return false;
                });
            });
        });

        const igIframes = document.querySelectorAll('iframe[src*="instagram.com"], iframe[src*="www.instagram.com"]');
        igIframes.forEach(iframe => {
            if (iframe.dataset.igLocked === '1') return;
            iframe.dataset.igLocked = '1';
        });
    };

    lockInstagramEmbeds();
    processInstagramEmbeds();

    setTimeout(lockInstagramEmbeds, 1500);
    setTimeout(lockInstagramEmbeds, 5000);
    setTimeout(processInstagramEmbeds, 1500);
    setTimeout(processInstagramEmbeds, 5000);

    const observer = new MutationObserver(() => {
        lockInstagramEmbeds();
        processInstagramEmbeds();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
