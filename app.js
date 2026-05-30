/* =========================================================
   NEURAL NETWORK CANVAS BACKGROUND
   Replaces particles.js — no external library needed
   ========================================================= */
(function () {
    const canvas = document.getElementById('neural-bg');
    const ctx = canvas.getContext('2d');

    let W, H, nodes = [], mouse = { x: -999, y: -999 };
    const NODE_COUNT = 90;
    const MAX_DIST = 160;
    const NODE_RADIUS = 2.2;
    const MAIN_COLOR = [255, 0, 255];
    const CYAN_COLOR = [0, 238, 255];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => { resize(); initNodes(); });
    resize();

    class Node {
        constructor() { this.reset(true); }
        reset(randomY = false) {
            this.x = Math.random() * W;
            this.y = randomY ? Math.random() * H : -NODE_RADIUS;
            this.vx = (Math.random() - 0.5) * 0.55;
            this.vy = (Math.random() - 0.5) * 0.55;
            this.radius = NODE_RADIUS + Math.random() * 1.2;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.018 + Math.random() * 0.025;
            this.colorMix = Math.random();
        }
        update() {
            this.pulse += this.pulseSpeed;
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * 0.6;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
            this.vx *= 0.985;
            this.vy *= 0.985;
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -20) this.x = W + 20;
            if (this.x > W + 20) this.x = -20;
            if (this.y < -20) this.y = H + 20;
            if (this.y > H + 20) this.y = -20;
        }
        draw() {
            const glowSize = this.radius + 2 + Math.sin(this.pulse) * 1.5;
            const r = Math.round(MAIN_COLOR[0] + (CYAN_COLOR[0] - MAIN_COLOR[0]) * this.colorMix);
            const g = Math.round(MAIN_COLOR[1] + (CYAN_COLOR[1] - MAIN_COLOR[1]) * this.colorMix);
            const b = Math.round(MAIN_COLOR[2] + (CYAN_COLOR[2] - MAIN_COLOR[2]) * this.colorMix);
            const alpha = 0.55 + Math.sin(this.pulse) * 0.2;

            // Glow
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize * 3);
            grd.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
            grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, glowSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Core dot
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${alpha + 0.2})`;
            ctx.fill();
        }
    }

    function initNodes() {
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Node());
    }

    function drawConnections() {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.35;
                    const mix = (nodes[i].colorMix + nodes[j].colorMix) / 2;
                    const r = Math.round(MAIN_COLOR[0] + (CYAN_COLOR[0] - MAIN_COLOR[0]) * mix);
                    const g = Math.round(MAIN_COLOR[1] + (CYAN_COLOR[1] - MAIN_COLOR[1]) * mix);
                    const b = Math.round(MAIN_COLOR[2] + (CYAN_COLOR[2] - MAIN_COLOR[2]) * mix);
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
    }

    function drawMouseConnections() {
        nodes.forEach(n => {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
                const opacity = (1 - dist / 180) * 0.55;
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(255,0,255,${opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        drawMouseConnections();
        nodes.forEach(n => { n.update(); n.draw(); });
        requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = -999;
        mouse.y = -999;
    });
    window.addEventListener('touchmove', e => {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }, { passive: true });

    initNodes();
    animate();
})();

/* =========================================================
   SCROLL PROGRESS BAR
   ========================================================= */
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('progress-bar').style.width = ((scrollTop / scrollHeight) * 100) + '%';
});

/* =========================================================
   NAV ACTIVE STATE ON SCROLL
   ========================================================= */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById('progress-bar').style.width = ((scrollTop / scrollHeight) * 100) + '%';

    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if (id && top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector('header nav a[href*=' + id + ']');
            if (activeLink) activeLink.classList.add('active');
        }
    });

    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
ScrollReveal({
    reset: true,
    distance: '20px',
    duration: 1800,
    delay: 150
});
ScrollReveal().reveal('.left', { origin: 'left' });
ScrollReveal().reveal('.right', { origin: 'right' });
ScrollReveal().reveal('.top', { origin: 'top' });
ScrollReveal().reveal('.bottom', { origin: 'bottom' });

/* =========================================================
   TYPED.JS
   ========================================================= */
const typed = new Typed('.multiple-text', {
    strings: [
        'Data Scientist',
        'Data Analyst',
        'ML Engineer',
        'NLP Specialist',
        'AI Solutions Builder'
    ],
    typeSpeed: 120,
    backSpeed: 100,
    backDelay: 1400,
    loop: true
});