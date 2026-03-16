/**
 * SilenVault Digital Store - Dynamic Google Sheets Engine
 * Fetches product data directly from the live Google Sheet.
 */

// ==========================================
// 1. PASTE YOUR GOOGLE SHEET ID HERE
// ==========================================
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; 

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

async function fetchAndRenderProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Google's API returns a padded JSON string. We must strip the padding to parse it.
        const jsonString = text.substring(47).slice(0, -2);
        const json = JSON.parse(jsonString);
        
        // Map the Google Sheet rows into a clean Javascript Array
        const products = json.table.rows.map(row => {
            return {
                id: row.c[0] ? row.c[0].v : '',
                title: row.c[1] ? row.c[1].v : '',
                description: row.c[2] ? row.c[2].v : '',
                price: row.c[3] ? row.c[3].v : '',
                type: row.c[4] ? row.c[4].v : 'Free', // 'Premium' or 'Free'
                tag: row.c[5] ? row.c[5].v : '',
                imageURL: row.c[6] ? row.c[6].v : '',
                checkoutUrl: row.c[7] ? row.c[7].v : '#'
            };
        }).filter(p => p.id !== ''); // Filter out empty rows

        // Split into Free and Premium categories
        const freeProducts = products.filter(p => p.type.toLowerCase() === 'free');
        const premiumProducts = products.filter(p => p.type.toLowerCase() === 'premium');

        renderGrid('free-product-grid', freeProducts);
        renderGrid('premium-product-grid', premiumProducts);

        // Re-initialize Lemon Squeezy after buttons are injected
        if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
        }

    } catch (error) {
        console.error("Database connection failed:", error);
        document.getElementById('free-product-grid').innerHTML = '<div class="col-span-full text-center text-red-400 mono">DATA SYNC FAILED. CHECK SHEET ID.</div>';
    }
}

function renderGrid(containerId, products) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-slate-500 mono">NO ASSETS FOUND IN THIS SECTOR.</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        // UI Logic: Is it Premium (Paid) or Free?
        const isPremium = product.type.toLowerCase() === 'premium';
        
        // Premium items get a glowing Diamond badge. Free items get a clean standard badge.
        const badgeHtml = isPremium 
            ? `<div class="absolute top-4 right-4 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.2)] backdrop-blur-md">
                 <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l5 5-5 11-5-11 5-5z"/></svg> PREMIUM
               </div>`
            : `<div class="absolute top-4 right-4 bg-white/10 text-white text-[9px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider mono backdrop-blur-md">
                 FREE ACCESS
               </div>`;

        return `
            <div class="premium-glass-card">
                <div class="card-media">
                    <img src="${product.imageURL}" alt="${product.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExIi8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5OTyBJTUFHRTwvdGV4dD48L3N2Zz4='">
                    
                    ${badgeHtml}
                    
                    <div class="absolute top-4 left-4 bg-black/60 text-slate-200 text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest backdrop-blur-md">
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
                            <span class="text-xs text-slate-500 mono uppercase tracking-widest mb-1">Price</span>
                            <span class="text-2xl font-bold ${isPremium ? 'text-blue-400' : 'text-white'} mono">${product.price}</span>
                        </div>
                        <a href="${product.checkoutUrl}" class="lemonsqueezy-button btn-action px-8 py-3 text-sm uppercase tracking-wide">
                            ${isPremium ? 'Buy Now' : 'Download'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
