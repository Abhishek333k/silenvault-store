/**
 * SilenVault Digital Armory - Core Layout Components
 * Upgraded Evolved Cyberpunk UI with Crest Integration
 */

// ==========================================
// TELEMETRY PROTOCOL (Google Analytics GA4)
// Automatically injected into all pages via DRY
// ==========================================
(function injectAnalytics() {
    if (!window.gtag) {
        // 1. Inject the external Google script
        const scriptExternal = document.createElement('script');
        scriptExternal.async = true;
        scriptExternal.src = 'https://www.googletagmanager.com/gtag/js?id=G-GRK3JQ36T6';
        document.head.appendChild(scriptExternal);

        // 2. Inject the initialization config
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
        // Strict path cleaner: removes trailing slash, ensures clean start
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
                        <a href="${cleanRequest}" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors font-mono">
                            Custom Request
                        </a>
                        <a href="https://silenvault.com" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors font-mono">
                            Return to Toolkit
                        </a>
                    </nav>

                </div>
            </header>
        `;
    }
}

class SVFooter extends HTMLElement {
    connectedCallback() {
        // Strict path cleaner for Footer
        let basePath = this.getAttribute('base-path') || '.';
        basePath = basePath.replace(/\/+$/, '');
        const cleanAssets = `${basePath}/assets`.replace(/\/+/g, '/');
        const cleanAbout = `${basePath}/about`.replace(/\/+/g, '/');
        const cleanSponsor = `${basePath}/sponsor`.replace(/\/+/g, '/');
        const cleanLegal = `${basePath}/legal`.replace(/\/+/g, '/');

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
                        <a href="${cleanLegal}#terms" class="text-xs text-slate-500 hover:text-white transition-colors mono">Terms</a>
                        <a href="${cleanLegal}#privacy" class="text-xs text-slate-500 hover:text-white transition-colors mono">Privacy</a>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('sv-header', SVHeader);
customElements.define('sv-footer', SVFooter);