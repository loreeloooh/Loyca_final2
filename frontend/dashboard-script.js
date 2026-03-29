// ===================================
// DASHBOARD INTERACTIVE SCRIPT
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las animaciones del dashboard
    initDashboardAnimations();
});

function initDashboardAnimations() {
    // Animar KPIs con contadores
    animateKPIs();
    
    // Animar gráficos de barras
    animateBarCharts();
    
    // Animar timeline con scroll
    initTimelineAnimation();
    
    // Animar progress bars de widgets
    animateWidgetProgress();
    
    // Animar quality bars
    animateQualityBars();
}

// Animación de contadores KPI
function animateKPIs() {
    const kpiValues = document.querySelectorAll('.kpi-value');
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseFloat(element.dataset.target);
                
                // Animar contador
                animateCounter(element, target);
                
                // Animar progress bar correspondiente
                const progressBar = element.parentElement.querySelector('.progress-bar');
                if (progressBar) {
                    const progress = parseFloat(progressBar.dataset.progress);
                    setTimeout(() => {
                        progressBar.style.width = progress + '%';
                    }, 500);
                }
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });
    
    kpiValues.forEach(kpi => observer.observe(kpi));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Formatear según el tipo de número
        if (target < 100) {
            element.textContent = current.toFixed(1);
        } else if (target < 1000) {
            element.textContent = Math.floor(current);
        } else {
            element.textContent = (current / 1000).toFixed(1) + 'K';
        }
    }, 16);
}

// Animación de gráficos de barras
function animateBarCharts() {
    const barFills = document.querySelectorAll('.bar-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const barFill = entry.target;
                const value = barFill.parentElement.dataset.value;
                
                setTimeout(() => {
                    barFill.style.height = value + '%';
                }, 300);
                
                observer.unobserve(barFill);
            }
        });
    }, { threshold: 0.5 });
    
    barFills.forEach(bar => observer.observe(bar));
}

// Animación de timeline con scroll
function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                const delay = parseInt(item.dataset.delay) || 0;
                
                setTimeout(() => {
                    item.classList.add('animate');
                    
                    // Animar progress bar del timeline
                    const progressFill = item.querySelector('.progress-fill');
                    if (progressFill) {
                        const progress = progressFill.dataset.progress;
                        setTimeout(() => {
                            progressFill.style.width = progress + '%';
                        }, 800);
                    }
                }, delay);
                
                observer.unobserve(item);
            }
        });
    }, { threshold: 0.3 });
    
    timelineItems.forEach(item => observer.observe(item));
}

// Animación de progress bars de widgets
function animateWidgetProgress() {
    const circularProgress = document.querySelectorAll('.circular-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circular = entry.target;
                const progress = circular.dataset.progress;
                
                // Animar el círculo de progreso
                const progressFill = circular.querySelector('.progress-fill');
                if (progressFill) {
                    const circumference = 2 * Math.PI * 54;
                    const offset = circumference - (progress / 100) * circumference;
                    
                    setTimeout(() => {
                        progressFill.style.strokeDashoffset = offset;
                    }, 500);
                }
                
                observer.unobserve(circular);
            }
        });
    }, { threshold: 0.5 });
    
    circularProgress.forEach(circle => observer.observe(circle));
}

// Animación de quality bars
function animateQualityBars() {
    const qualityFills = document.querySelectorAll('.quality-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const qualityFill = entry.target;
                const quality = qualityFill.dataset.quality;
                
                setTimeout(() => {
                    qualityFill.style.width = quality + '%';
                }, 300);
                
                observer.unobserve(qualityFill);
            }
        });
    }, { threshold: 0.5 });
    
    qualityFills.forEach(fill => observer.observe(fill));
}

// Efectos hover para widgets
document.addEventListener('DOMContentLoaded', function() {
    const widgetCards = document.querySelectorAll('.widget-card');
    
    widgetCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Efecto de brillo adicional al hover
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px) scale(1)';
        });
    });
    
    // Efectos hover para KPI cards
    const kpiCards = document.querySelectorAll('.kpi-card');
    
    kpiCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.kpi-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.kpi-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
    
    // Efectos hover para chart points
    const chartPoints = document.querySelectorAll('.chart-point');
    
    chartPoints.forEach(point => {
        point.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.3)';
        });
        
        point.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1)';
        });
    });
});

// Efecto de partículas sutiles para el dashboard
function createDashboardParticles() {
    const dashboardSection = document.querySelector('.dashboard-section');
    if (!dashboardSection) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(212, 175, 55, 0.3);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${10 + Math.random() * 20}s linear infinite;
        `;
        
        dashboardSection.appendChild(particle);
    }
    
    // Agregar estilo para partículas flotantes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar partículas
createDashboardParticles();
