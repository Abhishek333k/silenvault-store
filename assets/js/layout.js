/**
 * SilenVault Digital Armory - Core Layout Components
 * Upgraded Evolved Cyberpunk UI (Frosted Glass / Pure Black)
 */

class SVHeader extends HTMLElement {
    connectedCallback() {
        // Force the header to float fixed at the top, blurring the video behind it
        this.innerHTML = `
            <header class="fixed top-0 left-0 w-full z-50 bg-[#000000]/40 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    
                    <a href="/" class="flex items-center gap-3 group">
                        <div class="w-8 h-8 bg-[#ff003c] rounded flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,0,60,0.4)]">
                            <span class="text-black font-black text-xs font-mono">SV</span>
                        </div>
                        <span class="text-white font-black tracking-widest uppercase text-sm">
                            SilenVault <span class="text-slate-500 font-light">// ARMORY</span>
                        </span>
                    </a>

                    <nav class="hidden md:flex items-center gap-6">
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
        this.innerHTML = `
            <footer class="w-full bg-[#000000] border-t border-white/5 pt-12 pb-8 z-10 relative">
                <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                            <span class="text-white font-black text-[9px] font-mono">SV</span>
                        </div>
                        <span class="text-slate-500 text-xs font-mono uppercase tracking-widest">
                            © ${new Date().getFullYear()} SilenVault. All systems operational.
                        </span>
                    </div>
                    
                    <div class="flex gap-6">
                        <a href="mailto:support@silenvault.com" class="text-xs text-slate-500 hover:text-white transition-colors mono">Support</a>
                        <a href="legal.html#terms" class="text-xs text-slate-500 hover:text-white transition-colors mono">Terms of Service</a>
                        <a href="legal.html#privacy" class="text-xs text-slate-500 hover:text-white transition-colors mono">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Register the custom elements
customElements.define('sv-header', SVHeader);
customElements.define('sv-footer', SVFooter);
