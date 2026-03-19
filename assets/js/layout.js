/**
 * SilenVault Digital Armory - Core Layout Components
 * Upgraded Evolved Cyberpunk UI, Security, and Neural Cursor Engine (SPA Enabled)
 */

// ==========================================
// TELEMETRY PROTOCOL (Google Analytics GA4)
// ==========================================
(function injectAnalytics() {
    if (!window.gtag) {
        const scriptExternal = document.createElement('script');
        scriptExternal.async = true;
        scriptExternal.src = 'https://www.googletagmanager.com/gtag/js?id=G-GRK3JQ36T6';
        document.head.appendChild(scriptExternal);

        const scriptInit = document.createElement('script');
        scriptInit.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GRK3JQ36T6');
        `;
        document.head.appendChild(scriptInit);
    }
})();

// ==========================================
// COMPONENT ENGINE
// ==========================================
class SVHeader extends HTMLElement {
    connectedCallback() {
        let basePath = this.getAttribute('base-path') || '.';
        basePath = basePath.replace(/\/+$/, '');
        const cleanAssets = `${basePath}/assets`.replace(/\/+/g, '/');
        const cleanIndex = `${basePath}/index`.replace(/\/+/g, '/');
        const cleanRequest = `${basePath}/request`.replace(/\/+/g, '/');

        this.innerHTML = `
            <header class="fixed top-0 left-0 w-full z-50 bg-[#000000]/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <a href="${cleanIndex}" class="flex items-center gap-3 group">
                        <div class="w-8 h-8 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            <img src="${cleanAssets}/img/SILENVAULT_CREST.webp" alt="SilenVault Crest" class="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        </div>
                        <span class="text-white font-black tracking-widest uppercase text-sm">
                            SilenVault <span class="text-slate-500 font-light">// STORE</span>
                        </span>
                    </a>
                    <nav class="hidden md:flex items-center gap-6">
                        <a href="${cleanRequest}" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors font-mono">Custom Request</a>
                        <a href="https://silenvault.com" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors font-mono">Return to Toolkit</a>
                    </nav>
                </div>
            </header>
        `;
    }
}

class SVFooter extends HTMLElement {
    connectedCallback() {
        let basePath = this.getAttribute('base-path') || '.';
        basePath = basePath.replace(/\/+$/, '');
        const cleanAssets = `${basePath}/assets`.replace(/\/+/g, '/');
        const cleanAbout = `${basePath}/about`.replace(/\/+/g, '/');
        const cleanSponsor = `${basePath}/sponsor`.replace(/\/+/g, '/');

        this.innerHTML = `
            <footer class="w-full bg-[#000000] border-t border-white/5 pt-12 pb-8 z-10 relative">
                <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <img src="${cleanAssets}/img/SILENVAULT_CREST.webp" alt="SV" class="w-5 h-5 object-contain opacity-50">
                        <span class="text-slate-500 text-xs font-mono uppercase tracking-widest">
                            © ${new Date().getFullYear()} SilenVault. All systems operational.
                        </span>
                    </div>
                    <div class="flex flex-wrap justify-center gap-6">
                        <a href="${cleanAbout}" class="text-xs text-slate-500 hover:text-white transition-colors mono">About</a>
                        <a href="${cleanSponsor}" class="text-xs text-slate-500 hover:text-white transition-colors mono">Sponsor</a>
                        <a href="mailto:support@silenvault.com" class="text-xs text-slate-500 hover:text-white transition-colors mono">Support</a>
                        <a href="/terms" class="text-xs text-slate-500 hover:text-white transition-colors mono">Terms of Service</a>
                        <a href="/privacy" class="text-xs text-slate-500 hover:text-white transition-colors mono">Privacy Policy</a>
                        <a href="/refund" class="text-xs text-slate-500 hover:text-white transition-colors mono">Refund Policy</a>
                    </div>
                </div>
            </footer>
        `;
    }
}
customElements.define('sv-header', SVHeader);
customElements.define('sv-footer', SVFooter);

// ==========================================
// SILENVAULT GLOBAL SECURITY ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Block Context Menu & Dragging globally
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

    // 2. Block DevTools Shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'F12') return event.preventDefault(), false;
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key.toLowerCase() === 'i' || event.key.toLowerCase() === 'c' || event.key.toLowerCase() === 'j')) {
            return event.preventDefault(), false;
        }
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'u') return event.preventDefault(), false;
    });

    // 3. THE KILL SWITCH
    const triggerLockdown = () => {
        document.body.innerHTML = `
            <div style="background:#000000; color:#00F0FF; height:100vh; width:100vw; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Fira Code', monospace; z-index:999999; position:fixed; top:0; left:0; text-align:center;">
                <svg style="width:80px; height:80px; margin-bottom:20px; color:#ef4444;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <h1 style="font-size:2rem; font-weight:900; margin-bottom:10px; color:#fff;">[ SYSTEM LOCKDOWN ]</h1>
                <p style="font-size:1rem; color:#94a3b8;">Unauthorized inspector tools detected.<br>Session terminated to protect digital assets.</p>
            </div>
        `;
    };

    setInterval(function() {
        const start = performance.now(); debugger; const end = performance.now();
        if (end - start > 100) triggerLockdown();
    }, 2000);

    window.addEventListener('resize', () => {
        if ((window.outerWidth - window.innerWidth > 160) || (window.outerHeight - window.innerHeight > 160)) triggerLockdown();
    });

    // ==========================================
    // INJECT NEURAL CANVAS & TACTICAL CURSOR
    // ==========================================
    
    const cursorCSS = `
        body { 
            -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; 
        }
        @media (pointer: fine) { body, a, button, input, .cursor-pointer { cursor: none !important; } }
        
        /* Swup SPA Cinematic Transitions */
        .transition-fade {
            transition: opacity 0.4s ease-out, transform 0.4s ease-out;
            opacity: 1;
            transform: translateY(0);
        }
        html.is-animating .transition-fade {
            opacity: 0;
            transform: translateY(15px);
        }

        .cursor-wrapper { position: fixed; top: 0; left: 0; pointer-events: none; z-index: 2147483647 !important; transition: opacity 0.3s ease; }
        
        /* Core Arrow: High contrast, pure white, native size */
        /* Increased from 28px to 40px */
        .svg-cursor { 
            width: 40px; height: 40px; fill: none; stroke: #FFFFFF; stroke-width: 3; 
            filter: drop-shadow(0 0 2px rgba(0,0,0,1)) drop-shadow(0 0 4px rgba(255,255,255,0.7)); 
            transition: transform 0.15s ease-out, stroke 0.2s; 
            position: absolute; top: -20px; left: -20px; 
        }
        
        /* Hover State: Slight shrink, brighter glow */
        body.hovering .svg-cursor { transform: scale(0.85); stroke: #FFFFFF; filter: drop-shadow(0 0 2px rgba(0,0,0,1)) drop-shadow(0 0 6px rgba(255,255,255,0.9)); }
        
        /* Click State: Tightens slightly */
        body.clicking .svg-cursor { transform: scale(0.7); stroke-width: 4; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = cursorCSS;
    document.head.appendChild(styleSheet);

    // Inject Background
    if (!document.getElementById('neural-canvas')) {
        const bgHTML = `<div class="cinematic-bg" style="position: fixed; inset: 0; z-index: -2; background-color: #02040a; overflow: hidden;"><canvas id="neural-canvas"></canvas><div class="cinematic-vignette" style="position: absolute; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(circle at center, transparent 0%, #000000 100%), linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 80%, #000000 100%);"></div></div>`;
        document.body.insertAdjacentHTML('afterbegin', bgHTML);
    }

    // Inject Core Cursor Only
    if (!document.getElementById('cursor-core-wrapper')) {
        const cursorHTML = `
            <div id="cursor-core-wrapper" class="cursor-wrapper hidden md:block">
                <svg class="svg-cursor" viewBox="0 0 100 100"><g transform="rotate(-22.5 50 50)"><polygon points="50,50 65,95 50,85 35,95" fill="rgba(255,255,255,0.25)" stroke="#FFFFFF" stroke-width="2"/></g></svg>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', cursorHTML);
    }

    // ==========================================
    // SPA ROUTER ENGINE (Swup.js + Scroll Plugin)
    // ==========================================
    const swupScript = document.createElement('script');
    swupScript.src = "https://unpkg.com/swup@4";
    document.head.appendChild(swupScript);
    
    // Inject the Swup Scroll Plugin
    const swupScrollScript = document.createElement('script');
    swupScrollScript.src = "https://unpkg.com/@swup/scroll-plugin@3";
    document.head.appendChild(swupScrollScript);
    
    swupScript.onload = () => {
        swupScrollScript.onload = () => {
            // Initialize the Router with Scroll Restoration
            const swup = new Swup({
                containers: ['#swup'],
                animationSelector: '[class*="transition-"]',
                cache: true,
                plugins: [new SwupScrollPlugin()] // Handles the Back Button scroll memory!
            });

            // The Re-Ignition Sequence
            swup.hooks.on('page:view', () => {
                // 1. Force re-execute products.js so the grid builds and galleries work
                const oldScript = document.querySelector('script[src*="products.js"]');
                if (oldScript) {
                    const newScript = document.createElement('script');
                    newScript.src = oldScript.src;
                    newScript.defer = true;
                    oldScript.remove();
                    document.head.appendChild(newScript);
                }
                
                // 2. Re-initialize Lemon Squeezy Buttons
                if (window.createLemonSqueezy) {
                    window.createLemonSqueezy();
                }
                
                // (Notice we removed the hardcoded window.scrollTo. The plugin handles it now!)
            });
        };
    };

    // ==========================================
    // THE UNIFIED PHYSICS ENGINE
    // ==========================================
    const canvas = document.getElementById('neural-canvas');
    const ctx = canvas.getContext('2d');
    let width, height, particles = [], energyPulses = [], mouse = { x: null, y: null, radius: 150 };

    const coreWrapper = document.getElementById('cursor-core-wrapper');

    // Mouse Tracking & Viewport Exit Logic
    window.addEventListener('mousemove', (e) => { 
        mouse.x = e.clientX; mouse.y = e.clientY; 
        if(coreWrapper) {
            coreWrapper.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
            if(coreWrapper.style.opacity === '0') coreWrapper.style.opacity = '1';
        }
    });
    
    document.addEventListener('mouseleave', () => {
        mouse.x = null; mouse.y = null;
        if(coreWrapper) coreWrapper.style.opacity = '0';
    });
    window.addEventListener('blur', () => {
        mouse.x = null; mouse.y = null;
        if(coreWrapper) coreWrapper.style.opacity = '0';
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, .cursor-pointer, .btn-action, input')) document.body.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, .cursor-pointer, .btn-action, input')) document.body.classList.remove('hovering');
    });

    window.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    window.addEventListener('mouseup', () => {
        document.body.classList.remove('clicking');
        if (!mouse.x || !mouse.y) return;

        let connectedNodes = particles.filter(p => Math.hypot(p.x - mouse.x, p.y - mouse.y) < mouse.radius);

        connectedNodes.forEach(node => {
            let numSparks = 1 + Math.floor(Math.random() * 2);
            for(let i = 0; i < numSparks; i++) {
                energyPulses.push({
                    x: mouse.x + (Math.random() - 0.5) * 10,
                    y: mouse.y + (Math.random() - 0.5) * 10,
                    target: node, 
                    speed: 0.1 + Math.random() * 0.1
                });
            }
        });
    });

    function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; initParticles(); }
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * width; this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.5 + 0.5; 
            this.energyLevel = 0; 
            this.MAX_ENERGY = 2.0; 
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;
            if (this.energyLevel > 0) {
                this.energyLevel -= 0.04;
                if (this.energyLevel < 0) this.energyLevel = 0;
            }
        }
        draw() { 
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.radius + (this.energyLevel * 1.5), 0, Math.PI * 2); 
            if (this.energyLevel > 0.1) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(this.energyLevel, 1)})`;
                ctx.shadowBlur = 10 * this.energyLevel;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.shadowBlur = 0;
            }
            ctx.fill(); 
            ctx.shadowBlur = 0; 
        }
    }

    function initParticles() {
        particles = [];
        let numberOfParticles = (width * height) / 14000; 
        for (let i = 0; i < numberOfParticles; i++) particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(); particles[i].draw();
            
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x; let dy = particles[i].y - particles[j].y; let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath(); ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - dist/1000})`; ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                }
            }
            if (mouse.x != null && mouse.y != null) {
                let dx = particles[i].x - mouse.x; let dy = particles[i].y - mouse.y; let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    ctx.beginPath(); ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - dist/500})`; ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
            }
        }

        for (let i = energyPulses.length - 1; i >= 0; i--) {
            let p = energyPulses[i];
            let dx = p.target.x - p.x; let dy = p.target.y - p.y;
            let dist = Math.hypot(dx, dy);

            p.x += dx * p.speed; p.y += dy * p.speed;

            ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.fill(); ctx.shadowBlur = 0;

            if (dist < 5) {
                p.target.energyLevel = Math.min(p.target.energyLevel + 0.6, p.target.MAX_ENERGY); 
                energyPulses.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }
    resize(); animate();
});