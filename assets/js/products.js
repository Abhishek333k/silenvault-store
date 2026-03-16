/**
 * SilenVault Digital Store - Dynamic Google Sheets Engine
 * Advanced Protocol: Draft Filtering, Cache-Busting, and Multi-Image Hover Slideshows.
 */

const SHEET_ID = '1VvnEPxq42uf_ZJGLmTIpvJXs3J0tF2gYEh49NT47ZBw'; 
// Added timestamp to bypass Google's 5-minute CDN cache
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&t=${new Date().getTime()}`;

async function fetchAndRenderProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Google returns JSONP. Strip the wrapper to parse raw JSON.
        const jsonString = text.substring(47).slice(0, -2);
        const json = JSON.parse(jsonString);
        
        // Map Columns to Variables (Assuming structure: Status, ID, Title, Desc, Price, Type, Tag, Images, CheckoutURL)
        const products = json.table.rows.map(row => {
            return {
                status: row.c[0] ? row.c[0].v : 'Draft',
                id: row.c[1] ? row.c[1].v : '',
                title: row.c[2] ? row.c[2].v : '',
                description: row.c[3] ? row.c[3].v : '',
                price: row.c[4] ? row.c[4].v : 'FREE',
                type: row.c[5] ? row.c[5].v : 'Free',
                tag: row.c[6] ? row.c[6].v : 'Asset',
                imagesRaw: row.c[7] ? row.c[7].v : '',
                checkoutUrl: row.c[8] ? row.c[8].v : '#'
            };
        }).filter(p => p.id !== '' && p.status.toLowerCase() === 'published'); // CRITICAL: Only show Published items

        // Split into Categories
        const freeProducts = products.filter(p => p.type.toLowerCase() === 'free');
        const premiumProducts = products.filter(p => p.type.toLowerCase() === 'premium');

        renderGrid('free-product-grid', freeProducts);
        renderGrid('premium-product-grid', premiumProducts);

        // Bind Multi-Image Hover Logic
        initImageSliders();

        // Initialize Lemon Squeezy popups
        if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
        }

    } catch (error) {
        console.error("Database sync failed:", error);
        document.getElementById('free-product-grid').innerHTML = '<div class="col-span-full text-center text-red-500 mono font-bold">DATABASE SYNC FAILED. VERIFY SHEET PERMISSIONS.</div>';
    }
}

function renderGrid(containerId, products) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-slate-500 mono">NO INVENTORY AVAILABLE IN THIS SECTOR.</div>';
        return;
    }

    grid.innerHTML = products.map(product => {
        const isPremium = product.type.toLowerCase() === 'premium';
        
        // Multi-Image Logic: Split by Pipe '|' or Comma ','
        let images = product.imagesRaw.split(/\||,/).map(img => img.trim()).filter(img => img !== '');
        
        // Fallback placeholder if no image provided
        if (images.length === 0) {
            images = ["data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExIi8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIj5OTyBJTUFHRTwvdGV4dD48L3N2Zz4="];
        }

        // Check if string is a Base64 string, external URL, or local file in assets/img/
        const processImgString = (str) => {
            if (str.startsWith('data:image') || str.startsWith('http')) return str;
            return `assets/img/${str}`; // Assumes it's a local filename
        };

        // Generate HTML for multiple images (stacked for hover effect)
        const imageTags = images.map((img, index) => 
            `<img src="${processImgString(img)}" class="slider-img ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'} absolute inset-0 w-full h-full object-cover transition-opacity duration-700">`
        ).join('');

        // Badge Logic
        const badgeHtml = isPremium 
            ? `<div class="absolute top-4 right-4 z-20 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.2)] backdrop-blur-md">
                 <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l5 5-5 11-5-11 5-5z"/></svg> PREMIUM
               </div>`
            : `<div class="absolute top-4 right-4 z-20 bg-white/10 text-white text-[9px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider mono backdrop-blur-md">
                 FREE ACCESS
               </div>`;

        // UI Tag indicating multiple images
        const galleryIndicator = images.length > 1 
            ? `<div class="absolute bottom-4 right-4 z-20 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase backdrop-blur-md flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                ${images.length}
               </div>` 
            : '';

        return `
            <div class="premium-glass-card group flex flex-col h-full bg-[rgba(255,255,255,0.02)] backdrop-blur-[24px] border border-white/5 rounded-2xl overflow-hidden transition-all duration-400 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                <div class="card-media relative w-full h-56 bg-black border-b border-white/5 flex-shrink-0 slider-container" data-images="${images.length}">
                    ${imageTags}
                    ${badgeHtml}
                    ${galleryIndicator}
                    <div class="absolute top-4 left-4 z-20 bg-black/60 text-slate-200 text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest backdrop-blur-md">
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
                        <a href="${product.checkoutUrl}" class="lemonsqueezy-button btn-action px-8 py-3 bg-gradient-to-br from-white to-slate-300 text-black font-extrabold rounded-lg text-sm uppercase tracking-wide hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            ${isPremium ? 'Buy Now' : 'Download'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Logic for hovering over a card to cycle through multiple images
function initImageSliders() {
    const containers = document.querySelectorAll('.slider-container');
    
    containers.forEach(container => {
        const imageCount = parseInt(container.getAttribute('data-images'));
        if (imageCount <= 1) return; // Skip if only 1 image

        const images = container.querySelectorAll('.slider-img');
        let currentIndex = 0;
        let interval;

        container.addEventListener('mouseenter', () => {
            interval = setInterval(() => {
                images[currentIndex].classList.remove('opacity-100', 'z-10');
                images[currentIndex].classList.add('opacity-0', 'z-0');
                
                currentIndex = (currentIndex + 1) % imageCount;
                
                images[currentIndex].classList.remove('opacity-0', 'z-0');
                images[currentIndex].classList.add('opacity-100', 'z-10');
            }, 1500); // Changes image every 1.5 seconds on hover
        });

        container.addEventListener('mouseleave', () => {
            clearInterval(interval);
            // Reset to first image
            images[currentIndex].classList.remove('opacity-100', 'z-10');
            images[currentIndex].classList.add('opacity-0', 'z-0');
            currentIndex = 0;
            images[0].classList.remove('opacity-0', 'z-0');
            images[0].classList.add('opacity-100', 'z-10');
        });
    });
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
