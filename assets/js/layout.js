/**
 * SilenVault Digital Armory - Core Layout Components
 * Upgraded Evolved Cyberpunk UI with Crest Integration
 */

class SVHeader extends HTMLElement {
    connectedCallback() {
        const basePath = this.getAttribute('base-path') || '.';
        this.innerHTML = `
            <header class="fixed top-0 left-0 w-full z-50 bg-[#000000]/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    
                    <a href="${basePath}/index.html" class="flex items-center gap-3 group">
                        <div class="w-8 h-8 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                            <img src="${basePath}/assets/img/SILENVAULT_CREST.webp" alt="SilenVault Crest" class="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        </div>
                        <span class="text-white font-black tracking-widest uppercase text-sm">
                            SilenVault <span class="text-slate-500 font-light">// ARMORY</span>
                        </span>
                    </a>

                    <nav class="hidden md:flex items-center gap-6">
                        <a href="${basePath}/request.html" class="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors font-mono">
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
        const basePath = this.getAttribute('base-path') || '.';
        this.innerHTML = `
            <footer class="w-full bg-[#000000] border-t border-white/5 pt-12 pb-8 z-10 relative">
                <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <img src="${basePath}/assets/img/SILENVAULT_CREST.webp" alt="SV" class="w-5 h-5 object-contain opacity-50">
                        <span class="text-slate-500 text-xs font-mono uppercase tracking-widest">
                            © ${new Date().getFullYear()} SilenVault. All systems operational.
                        </span>
                    </div>
                    
                    <div class="flex flex-wrap justify-center gap-6">
                        <a href="${basePath}/sponsor.html" class="text-xs text-slate-500 hover:text-white transition-colors mono">Sponsor Protocol</a>
                        <a href="mailto:support@silenvault.com" class="text-xs text-slate-500 hover:text-white transition-colors mono">Support</a>
                        <a href="${basePath}/legal.html#terms" class="text-xs text-slate-500 hover:text-white transition-colors mono">Terms of Service</a>
                        <a href="${basePath}/legal.html#privacy" class="text-xs text-slate-500 hover:text-white transition-colors mono">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('sv-header', SVHeader);
customElements.define('sv-footer', SVFooter);
