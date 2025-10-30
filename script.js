// Ultra-Premium AlaminEdge Website JavaScript
class AlaminEdgePremium {
    constructor() {
        this.init();
    }

    init() {
        this.setupPreloader();
        this.setupNavigation();
        this.setupThemeSwitcher();
        this.setupSettingsPanel();
        this.setupAnimations();
        this.setupParticles();
        this.setupCounters();
        this.setupCharts();
        this.setupInteractiveElements();
        this.setupPerformanceMonitoring();
    }

    setupPreloader() {
        window.addEventListener('load', () => {
            const preloader = document.querySelector('.preloader');
            setTimeout(() => {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 2000);
        });
    }

    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const header = document.querySelector('.header');

        // Mobile menu toggle
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        // Smooth scrolling for anchor links
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

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar') && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    setupThemeSwitcher() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        const currentTheme = localStorage.getItem('theme') || 'dark';

        // Set initial theme
        this.applyTheme(currentTheme);

        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
                themeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update particle colors based on theme
        this.updateParticleColors(theme);
    }

    updateParticleColors(theme) {
        const colors = {
            dark: ['#6366f1', '#8b5cf6', '#06d6a0'],
            light: ['#3b82f6', '#8b5cf6', '#10b981'],
            neon: ['#00ff88', '#00ccff', '#ff0088']
        };

        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
            window.pJSDom[0].pJS.particles.color.value = colors[theme] || colors.dark;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    }

    setupSettingsPanel() {
        const settingsToggle = document.querySelector('.settings-toggle');
        const settingsPanel = document.querySelector('.settings-panel');
        const intensitySlider = document.getElementById('animation-intensity');
        const particleSlider = document.getElementById('particle-density');
        const colorScheme = document.getElementById('color-scheme');
        const resetBtn = document.getElementById('reset-settings');

        // Toggle settings panel
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('open');
        });

        // Animation intensity
        intensitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            document.documentElement.style.setProperty('--animation-intensity', `${value}%`);
            this.updateAnimationSpeed(value);
        });

        // Particle density
        particleSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.updateParticleDensity(value);
        });

        // Color scheme
        colorScheme.addEventListener('change', (e) => {
            this.applyColorScheme(e.target.value);
        });

        // Reset settings
        resetBtn.addEventListener('click', () => {
            this.resetSettings();
        });

        // Load saved settings
        this.loadSettings();
    }

    updateAnimationSpeed(intensity) {
        const speed = intensity / 100;
        document.documentElement.style.setProperty('--transition-normal', `${0.3 * speed}s ease`);
    }

    updateParticleDensity(density) {
        if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS) {
            window.pJSDom[0].pJS.particles.number.value = density;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
        localStorage.setItem('particleDensity', density);
    }

    applyColorScheme(scheme) {
        const schemes = {
            default: {
                primary: '#6366f1',
                secondary: '#06d6a0',
                accent: '#f59e0b'
            },
            purple: {
                primary: '#8b5cf6',
                secondary: '#ec4899',
                accent: '#f59e0b'
            },
            emerald: {
                primary: '#10b981',
                secondary: '#3b82f6',
                accent: '#f59e0b'
            },
            amber: {
                primary: '#f59e0b',
                secondary: '#ef4444',
                accent: '#8b5cf6'
            }
        };

        const colors = schemes[scheme] || schemes.default;
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}`, value);
        });

        localStorage.setItem('colorScheme', scheme);
    }

    resetSettings() {
        localStorage.removeItem('animationIntensity');
        localStorage.removeItem('particleDensity');
        localStorage.removeItem('colorScheme');
        
        document.getElementById('animation-intensity').value = 80;
        document.getElementById('particle-density').value = 80;
        document.getElementById('color-scheme').value = 'default';
        
        this.updateAnimationSpeed(80);
        this.updateParticleDensity(80);
        this.applyColorScheme('default');
    }

    loadSettings() {
        const intensity = localStorage.getItem('animationIntensity') || 80;
        const density = localStorage.getItem('particleDensity') || 80;
        const scheme = localStorage.getItem('colorScheme') || 'default';

        document.getElementById('animation-intensity').value = intensity;
        document.getElementById('particle-density').value = density;
        document.getElementById('color-scheme').value = scheme;

        this.updateAnimationSpeed(intensity);
        this.updateParticleDensity(density);
        this.applyColorScheme(scheme);
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.service-card, .feature-card, .stat').forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    setupParticles() {
        // Particle.js configuration
        if (typeof particlesJS !== 'undefined') {
            particlesJS('particles-js', {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: ['#6366f1', '#8b5cf6', '#06d6a0'] },
                    shape: { type: 'circle' },
                    opacity: { value: 0.5, random: true },
                    size: { value: 3, random: true },
                    line_linked: {
                        enable: true,
                        distance: 150,
                        color: '#6366f1',
                        opacity: 0.2,
                        width: 1
                    },
                    move: {
                        enable: true,
                        speed: 2,
                        direction: 'none',
                        random: true,
                        straight: false,
                        out_mode: 'out',
                        bounce: false
                    }
                },
                interactivity: {
                    detect_on: 'canvas',
                    events: {
                        onhover: { enable: true, mode: 'repulse' },
                        onclick: { enable: true, mode: 'push' },
                        resize: true
                    }
                },
                retina_detect: true
            });
        }
    }

    setupCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(counter) {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.round(current) + (counter.dataset.count.includes('.') ? '.' + (target % 1).toFixed(1).split('.')[1] : '');
        }, 16);
    }

    setupCharts() {
        // Hero chart
        const heroCtx = document.getElementById('hero-chart');
        if (heroCtx) {
            new Chart(heroCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Performance',
                        data: [65, 78, 90, 81, 86, 95],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { display: false },
                        x: { display: false }
                    }
                }
            });
        }
    }

    setupInteractiveElements() {
        // Floating dashboard interaction
        const dashboard = document.querySelector('.floating-dashboard');
        if (dashboard) {
            dashboard.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                dashboard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
            });

            dashboard.addEventListener('mouseenter', () => {
                dashboard.style.transition = 'none';
            });

            dashboard.addEventListener('mouseleave', () => {
                dashboard.style.transition = 'transform 0.5s ease';
                dashboard.style.transform = 'rotateY(0deg) rotateX(0deg)';
            });
        }

        // Gradient orb animation
        this.animateGradientOrbs();
    }

    animateGradientOrbs() {
        const orbs = document.querySelectorAll('.orb');
        orbs.forEach((orb, index) => {
            orb.style.animationDelay = `${index * 2}s`;
        });
    }

    setupPerformanceMonitoring() {
        // Monitor page performance
        const monitorPerformance = () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', navigationTiming.loadEventEnd - navigationTiming.navigationStart);
        };

        window.addEventListener('load', monitorPerformance);

        // Monitor largest contentful paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
    }
}

// Initialize the premium website
document.addEventListener('DOMContentLoaded', () => {
    new AlaminEdgePremium();
});

// Additional utility functions
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlaminEdgePremium;
}
