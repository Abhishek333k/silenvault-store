/**
 * SilenVault Digital Armory - Product Matrix
 * Add, remove, or modify your products here. The engine will auto-render the grid.
 */

const svProducts = [
    {
        id: "core-pack-01",
        title: "The Core Pack (4K)",
        description: "A curated pack of high-fidelity, seamless 4K live wallpapers. Includes perfectly cropped Ultra-Wide PC and Vertical Mobile files.",
        price: "$3.99",
        tag: "Visual Asset",
        checkoutUrl: "#", // REPLACE WITH LEMON SQUEEZY LINK
        // CSS Animated Mesh for Wallpapers
        mediaHtml: `<div class="animated-mesh"></div>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="text-white/50 font-bold tracking-widest uppercase mono text-xs">Live Preview</span>
                    </div>`
    },
    {
        id: "os-ghost-config",
        title: "OS Ghost Config",
        description: "A lightweight batch execution script to instantly kill telemetry, flush temp cache, and optimize Windows 11 for pure development focus.",
        price: "$4.99",
        tag: "Automation",
        checkoutUrl: "#", // REPLACE WITH LEMON SQUEEZY LINK
        // SVG Placeholder for Scripts
        mediaHtml: `<div class="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                        <svg class="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 9l3 3-3 3m5 0h3M4 17h16a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                    </div>`
    },
    {
        id: "vaultforge-sandbox",
        title: "VaultForge Sandbox",
        description: "The exact local Electron testing environment used to build SilenVault tools. Includes the stealth Ghost Renderer and hotkey configurations.",
        price: "$14.99",
        tag: "Software",
        checkoutUrl: "#", // REPLACE WITH LEMON SQUEEZY LINK
        // SVG Placeholder for Software
        mediaHtml: `<div class="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                        <svg class="w-16 h-16 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>`
    }
    // TO ADD A NEW PRODUCT, JUST COPY/PASTE ONE OF THE BLOCKS ABOVE.
];

function renderProductMatrix() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const html = svProducts.map(product => `
        <div class="premium-glass-card">
            <div class="card-media">
                ${product.mediaHtml}
                <div class="absolute top-4 left-4 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full tag-visual mono">
                    ${product.tag}
                </div>
            </div>
            <div class="p-8 flex flex-col flex-1">
                <h2 class="text-2xl font-bold text-white mb-3 tracking-tight">${product.title}</h2>
                <p class="text-sm text-slate-400 mb-8 flex-1 font-light leading-relaxed">
                    ${product.description}
                </p>
                <div class="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                    <div class="flex flex-col">
                        <span class="text-xs text-slate-500 mono uppercase tracking-widest mb-1">License</span>
                        <span class="text-2xl font-bold text-white mono">${product.price}</span>
                    </div>
                    <a href="${product.checkoutUrl}" class="lemonsqueezy-button btn-vip px-8 py-3 text-sm uppercase tracking-wide">
                        Acquire
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    grid.innerHTML = html;

    // We must re-initialize Lemon Squeezy AFTER we inject the buttons, 
    // otherwise the checkout popups won't bind to the dynamic HTML.
    if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
    }
}

// Render products as soon as the DOM is ready
document.addEventListener('DOMContentLoaded', renderProductMatrix);
