/**
 * SilenVault Digital Store - Dynamic Engine
 * Features: Categories, Fuse.js Smart Search, Instant Skeletons, Custom Empty States
 */

const SHEET_ID = '1VvnEPxq42uf_ZJGLmTIpvJXs3J0tF2gYEh49NT47ZBw'; 
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&t=${new Date().getTime()}`;
const REPO_PATH = 'Abhishek333k/silenvault-store'; 

// Global Storage for filtering and search
let allProducts = [];
let fuse; // The Search Engine

// 1. MAIN FETCH & RENDER LOOP
async function fetchAndRenderProducts() {
    const freeGrid = document.getElementById('free-product-grid');
    const premiumGrid = document.getElementById('premium-product-grid');
    
    // INSTANT LOADING SKELETONS
    const loaderHTML = `<div class="col-span-full flex flex-col items-center justify-center py-20"><div class="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-4"></div><span class="mono text-xs text-[#00F0FF] tracking-widest uppercase">Loading Products...</span></div>`;
    if(freeGrid) freeGrid.innerHTML = loaderHTML;
    if(premiumGrid) premiumGrid.innerHTML = loaderHTML;

    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const jsonString = text.substring(47).slice(0, -2);
        const json = JSON.parse(jsonString);
        
        const productsRaw = json.table.rows.map(row => {
            return {
                status: row.c[0] ? row.c[0].v : 'Draft',
                id: row.c[1] ? row.c[1].v : '',
                title: row.c[2] ? row.c[2].v : '',
                description: row.c[3] ? row.c[3].v : '',
                price: row.c[4] ? row.c[4].v : 'FREE',
                type: row.c[5] ? row.c[5].v : 'Free',
                tag: row.c[6] ? row.c[6].v : 'Asset', // Used for Main UI Category Buttons
                folderPath: row.c[7] ? row.c[7].v : '',
                checkoutUrl: row.c[8] ? row.c[8].v : '#',
                smartTags: row.c[9] ? row.c[9].v : '' // Hidden metadata used ONLY by Fuse.js
            };
        }).filter(p => p.id !== '' && p.status.toLowerCase() === 'published');

        allProducts = await Promise.all(productsRaw.map(async (p) => {
            const files = await scanDirectory(p.folderPath);
            p.images = files.filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.gif'));
            return p;
        }));

        // Initialize Fuse.js Search Engine
        if (typeof Fuse !== 'undefined') {
            fuse = new Fuse(allProducts, {
                keys: [
                    { name: 'title', weight: 0.5 },
                    { name: 'smartTags', weight: 0.3 },
                    { name: 'description', weight: 0.2 }
                ],
                threshold: 0.3, // Allows slight typos
                ignoreLocation: true
            });
        }

        // Build the broad Category Sidebar
        buildCategoryBar();
        
        // Render initial view (All)
        filterAndRender('all');

        // Setup the real-time search listener
        setupSearchListener();

        if (window.createLemonSqueezy) window.createLemonSqueezy();

    } catch (error) {
        console.error("Database sync failed:", error);
        if(freeGrid) freeGrid.innerHTML = '<div class="col-span-full text-center text-red-500 mono font-bold">DATABASE SYNC FAILED.</div>';
    }
}

// 2. SEARCH LISTENER
function setupSearchListener() {
    const searchInput = document.getElementById('store-search');
    if(!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Reset category UI buttons to "All" when user starts typing a search
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('border-[#00F0FF]', 'bg-[#00F0FF]/10', 'text-[#00F0FF]');
            btn.classList.add('border-white/20', 'bg-white/5', 'text-slate-300');
            if (btn.innerText === 'ALL CATEGORIES') {
                btn.classList.add('border-[#00F0FF]', 'bg-[#00F0FF]/10', 'text-[#00F0FF]');
            }
        });

        if (query === '') {
            renderProductArrays(allProducts);
        } else if (fuse) {
            // Fuzzy search across Title, Description, and SmartTags
            const results = fuse.search(query).map(result => result.item);
            renderProductArrays(results);
        }
    });
}

// 3. CATEGORY BUILDER (Clean Navigation based on Column 7)
function buildCategoryBar() {
    const filterContainer = document.getElementById('category-filters');
    if (!filterContainer) return;

    let uniqueCategories = new Set();
    allProducts.forEach(p => {
        if (p.tag) {
            uniqueCategories.add(p.tag.trim());
        }
    });

    let buttonsHTML = `<button onclick="filterAndRender('all')" class="filter-btn active-filter px-4 py-1.5 rounded-full border border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] text-[10px] font-bold uppercase mono transition-all hover:bg-[#00F0FF]/20">ALL CATEGORIES</button>`;
    
    uniqueCategories.forEach(cat => {
        if(cat.length > 1) { 
            buttonsHTML += `<button onclick="filterAndRender('${cat}')" class="filter-btn px-4 py-1.5 rounded-full border border-white/20 bg-white/5 text-slate-300 text-[10px] font-bold uppercase mono transition-all hover:bg-white/10 hover:border-white/40" data-cat="${cat}">${cat}</button>`;
        }
    });

    filterContainer.innerHTML = buttonsHTML;
}

// 4. CATEGORY FILTER LOGIC
window.filterAndRender = function(selectedCat) {
    const searchInput = document.getElementById('store-search');
    if(searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('border-[#00F0FF]', 'bg-[#00F0FF]/10', 'text-[#00F0FF]');
        btn.classList.add('border-white/20', 'bg-white/5', 'text-slate-300');
        
        if (selectedCat === 'all' && btn.innerText === 'ALL CATEGORIES') {
            btn.classList.add('border-[#00F0FF]', 'bg-[#00F0FF]/10', 'text-[#00F0FF]');
        } else if (btn.getAttribute('data-cat') === selectedCat) {
            btn.classList.add('border-[#00F0FF]', 'bg-[#00F0FF]/10', 'text-[#00F0FF]');
        }
    });

    let filteredProducts = allProducts;
    if (selectedCat !== 'all') {
        filteredProducts = allProducts.filter(p => p.tag.toLowerCase() === selectedCat.toLowerCase());
    }

    renderProductArrays(filteredProducts);
};

// Helper function to render arrays
function renderProductArrays(productsArray) {
    const freeProducts = productsArray.filter(p => p.type.toLowerCase() === 'free');
    const premiumProducts = productsArray.filter(p => p.type.toLowerCase() === 'premium');

    renderGrid('free-product-grid', freeProducts);
    renderGrid('premium-product-grid', premiumProducts);
    
    initImageSliders();
    initCustomVideoPlayers();
}

// 5. GITHUB API DIRECTORY SCANNER
async function scanDirectory(folderPath) {
    if (!folderPath || !folderPath.includes('/')) return []; 
    folderPath = folderPath.replace(/\/$/, '');
    const cacheKey = `sv_dir_${folderPath}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
        const apiUrl = `https://api.github.com/repos/${REPO_PATH}/contents/${folderPath}`;
        const res = await fetch(apiUrl);
        if (!res.ok) return []; 
        const data = await res.json();
        const files = data.filter(item => item.type === 'file').map(item => `/${folderPath}/${item.name}`);
        sessionStorage.setItem(cacheKey, JSON.stringify(files));
        return files;
    } catch (e) {
        return [];
    }
}

// 6. RENDER UI GRID
function renderGrid(containerId, products) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    // --- RESTORED: EMPTY STATE LOGIC WITH FLASK ICON ---
    if (products.length === 0) {
        let emptyMessage = "No assets match your search criteria.";
        
        // Only show "under development" if the search bar is empty
        const searchInput = document.getElementById('store-search');
        if (!searchInput || searchInput.value.trim() === '') {
            if (containerId === 'premium-product-grid') {
                emptyMessage = "Premium collection currently in development. Check back soon.";
            } else if (containerId === 'free-product-grid') {
                emptyMessage = "Free resources are currently being updated. Check back soon.";
            }
        }

        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 opacity-70">
                <svg class="w-12 h-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <p class="text-slate-400 font-mono text-sm tracking-wide text-center uppercase">${emptyMessage}</p>
            </div>`;
        return;
    }

    grid.innerHTML = products.map(product => {
        const isPremium = product.type.toLowerCase() === 'premium';
        let mediaHtml = '';

        const badgeHtml = isPremium 
            ? `<div class="absolute top-4 right-4 z-30 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider flex items-center gap-1 backdrop-blur-md"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l5 5-5 11-5-11 5-5z"/></svg> PREMIUM</div>`
            : `<div class="absolute top-4 right-4 z-30 bg-white/10 text-white text-[9px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider mono backdrop-blur-md">FREE</div>`;

        if (product.videos && product.videos.length > 0) {
            mediaHtml = `
                <div class="custom-video-wrapper w-full h-full relative group">
                    <video src="${product.videos[0]}" class="w-full h-full object-cover" playsinline preload="metadata" loop></video>
                    
                    <div class="center-play-btn absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors cursor-pointer z-10">
                        <div class="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110">
                            <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                        </div>
                    </div>

                    <div class="custom-controls absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button class="play-pause-btn text-white hover:text-blue-400 transition-colors">
                            <svg class="w-5 h-5 play-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                            <svg class="w-5 h-5 pause-icon hidden" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg>
                        </button>
                        
                        <div class="progress-container flex-1 h-1 bg-white/20 rounded cursor-pointer relative">
                            <div class="progress-bar absolute top-0 left-0 h-full bg-blue-400 rounded pointer-events-none" style="width: 0%;"></div>
                        </div>

                        <button class="mute-btn text-white hover:text-blue-400 transition-colors">
                            <svg class="w-5 h-5 vol-up" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2l5 5V3l-5 5H7a2 2 0 00-2 2z"/></svg>
                            <svg class="w-5 h-5 vol-mute hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd"/><path stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>
                        </button>
                        <button class="fullscreen-btn text-white hover:text-blue-400 transition-colors">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                        </button>
                    </div>
                </div>`;
        } else if (product.images && product.images.length > 0) {
            const imageTags = product.images.map((img, index) => 
                `<div class="slider-img ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'} absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-700" style="background-image: url('${img}');">
                    <img src="/watermark.png" alt="" class="absolute inset-0 w-full h-full !cursor-none pointer-events-auto" style="opacity: 0;" oncontextmenu="return false;" draggable="false">
                </div>`
            ).join('');
            
            const galleryIndicator = product.images.length > 1 
                ? `<div class="absolute bottom-4 right-4 z-20 bg-black/60 text-white text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase backdrop-blur-md flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> ${product.images.length}
                   </div>` : '';

            mediaHtml = `
                <div class="slider-container w-full h-full relative" data-images="${product.images.length}">
                    ${imageTags}
                    ${galleryIndicator}
                </div>`;
        } else {
            mediaHtml = `<div class="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 text-xs mono">NO MEDIA FOUND</div>`;
        }

        // --- INJECT MAX 3 SMART TAGS INTO CARD FOR CLEAN UX ---
        const tagBadges = product.smartTags ? product.smartTags.split(',').slice(0,3).map(t => `<span class="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] uppercase">${t.trim()}</span>`).join('') : '';

        return `
            <div onclick="window.location.href='/item/${product.id}/'" class="cursor-pointer premium-glass-card group flex flex-col h-full bg-[rgba(255,255,255,0.02)] backdrop-blur-[24px] border border-white/5 rounded-2xl overflow-hidden transition-all duration-400 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] product-card" data-tag="${product.tag.toLowerCase()}">
                <div class="card-media relative w-full h-56 bg-black border-b border-white/5 flex-shrink-0">
                    ${mediaHtml}
                    ${badgeHtml}
                    <div class="absolute top-4 left-4 z-30 bg-black/60 text-slate-200 text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest backdrop-blur-md pointer-events-none">
                        ${product.tag}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <h2 class="text-xl font-bold text-white mb-2 tracking-tight">${product.title}</h2>
                    <p class="text-sm text-slate-400 mb-4 flex-1 font-light leading-relaxed line-clamp-2">${product.description}</p>
                    
                    <div class="flex flex-wrap gap-1 mb-4">
                        ${tagBadges}
                    </div>
                    
                    <div class="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Price</span>
                            <span class="text-xl font-bold ${isPremium ? 'text-blue-400' : 'text-white'} mono">${product.price}</span>
                        </div>
                        <a href="${product.checkoutUrl}" onclick="event.stopPropagation();" class="lemonsqueezy-button bg-white text-black font-bold rounded px-6 py-2 text-sm transition-transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] relative z-40">
                            ${isPremium ? 'Buy Now' : 'Download'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 7. LOGIC: MULTI-IMAGE HOVER
function initImageSliders() {
    document.querySelectorAll('.product-card').forEach(card => {
        const productTag = card.getAttribute('data-tag') || '';
        if (!productTag.includes('wallpaper')) return; 

        const container = card.querySelector('.slider-container');
        if (!container) return;

        const imageCount = parseInt(container.getAttribute('data-images'));
        if (imageCount <= 1) return; 

        const images = container.querySelectorAll('.slider-img');
        let currentIndex = 0;
        let interval;

        card.addEventListener('mouseenter', () => {
            interval = setInterval(() => {
                images[currentIndex].classList.remove('opacity-100', 'z-10');
                images[currentIndex].classList.add('opacity-0', 'z-0');
                currentIndex = (currentIndex + 1) % imageCount;
                images[currentIndex].classList.remove('opacity-0', 'z-0');
                images[currentIndex].classList.add('opacity-100', 'z-10');
            }, 3000); 
        });

        card.addEventListener('mouseleave', () => {
            clearInterval(interval);
            images[currentIndex].classList.remove('opacity-100', 'z-10');
            images[currentIndex].classList.add('opacity-0', 'z-0');
            currentIndex = 0;
            images[0].classList.remove('opacity-0', 'z-0');
            images[0].classList.add('opacity-100', 'z-10');
        });
    });
}

// 8. LOGIC: CUSTOM VIDEO PLAYER
function initCustomVideoPlayers() {
    document.querySelectorAll('.custom-video-wrapper').forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const centerPlayBtn = wrapper.querySelector('.center-play-btn');
        const playPauseBtn = wrapper.querySelector('.play-pause-btn');
        const playIcon = wrapper.querySelector('.play-icon');
        const pauseIcon = wrapper.querySelector('.pause-icon');
        const muteBtn = wrapper.querySelector('.mute-btn');
        const volUpIcon = wrapper.querySelector('.vol-up');
        const volMuteIcon = wrapper.querySelector('.vol-mute');
        const progressBar = wrapper.querySelector('.progress-bar');
        const progressContainer = wrapper.querySelector('.progress-container');
        const fullscreenBtn = wrapper.querySelector('.fullscreen-btn');

        const togglePlay = () => {
            if (video.paused) {
                video.play();
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                centerPlayBtn.classList.add('opacity-0', 'pointer-events-none');
            } else {
                video.pause();
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                centerPlayBtn.classList.remove('opacity-0', 'pointer-events-none');
            }
        };

        centerPlayBtn.addEventListener('click', togglePlay);
        playPauseBtn.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);

        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = !video.muted;
            if (video.muted) {
                volUpIcon.classList.add('hidden');
                volMuteIcon.classList.remove('hidden');
            } else {
                volUpIcon.classList.remove('hidden');
                volMuteIcon.classList.add('hidden');
            }
        });

        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percent}%`;
        });

        progressContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });

        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.requestFullscreen) video.requestFullscreen();
            else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        });
    });
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);