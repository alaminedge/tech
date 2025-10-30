// Advanced Particle Configuration
const particleConfigs = {
    default: {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: ["#6366f1", "#8b5cf6", "#06d6a0"] },
            shape: { 
                type: "circle",
                stroke: { width: 0, color: "#000000" }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#6366f1",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: { enable: false, rotateX: 600, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
                resize: true
            },
            modes: {
                grab: { distance: 400, line_linked: { opacity: 1 } },
                bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
                repulse: { distance: 100, duration: 0.4 },
                push: { particles_nb: 4 },
                remove: { particles_nb: 2 }
            }
        },
        retina_detect: true
    },
    premium: {
        // Enhanced particle configuration for premium feel
        particles: {
            number: { value: 100, density: { enable: true, value_area: 1000 } },
            color: { value: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"] },
            shape: { 
                type: ["circle", "triangle", "polygon"],
                polygon: { nb_sides: 6 }
            },
            opacity: {
                value: 0.7,
                random: true,
                anim: { enable: true, speed: 0.8, opacity_min: 0.2, sync: false }
            },
            size: {
                value: 4,
                random: true,
                anim: { enable: true, speed: 3, size_min: 0.5, sync: false }
            },
            line_linked: {
                enable: true,
                distance: 120,
                color: "#ffffff",
                opacity: 0.2,
                width: 1.2
            },
            move: {
                enable: true,
                speed: 2.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "bounce",
                bounce: true,
                attract: { enable: true, rotateX: 600, rotateY: 1200 }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "bubble" },
                resize: true
            }
        }
    }
};
