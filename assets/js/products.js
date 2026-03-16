/**
 * SilenVault Digital Store - Dynamic Engine
 * Features: Google Sheets CMS, GitHub API Folder Scanning, Custom Video Player, Empty States
 */

const SHEET_ID = '1VvnEPxq42uf_ZJGLmTIpvJXs3J0tF2gYEh49NT47ZBw'; 
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&t=${new Date().getTime()}`;
const REPO_PATH = 'Abhishek333k/silenvault-store'; // Used for dynamic folder scanning

// 1. MAIN FETCH & RENDER LOOP
async function fetchAndRenderProducts() {
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
                tag: row.c[6] ? row.c[6].v : 'Asset',
                folderPath: row.c[7] ? row.c[7].v : '', // This is a folder path (e.g. assets/products/pack-01)
                checkoutUrl: row.c[8] ? row.c[8].v : '#'
            };
        }).filter(p => p.id !== '' && p.status.toLowerCase() === 'published');

        // We must await the folder scanning for all products before rendering
        const products = await Promise.all(productsRaw.map(async (p) => {
            const files = await scanDirectory(p.folderPath);
            p.videos = files.filter(f => f.endsWith('.mp4') || f.endsWith('.webm'));
            p.images = files.filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.gif'));
            return p;
        }));

        const freeProducts = products.filter(p => p.type.toLowerCase() === 'free');
        const premiumProducts = products.filter(p => p.type.toLowerCase() === 'premium');

        renderGrid('free-product-grid', freeProducts);
        renderGrid('premium-product-grid', premiumProducts);

        initImageSliders();
        initCustomVideoPlayers();

        if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
        }

    } catch (error) {
        console.error("Database sync failed:", error);
        document.getElementById('free-product-grid').innerHTML = '<div class="col-span-full text-center text-red-500 mono font-bold">DATABASE SYNC FAILED.</div>';
    }
}

// 2. GITHUB API DIRECTORY SCANNER (With Session Cache)
async function scanDirectory(folderPath) {
    if (!folderPath || !folderPath.includes('/')) return []; // Not a valid path
    
    // Clean trailing slashes
    folderPath = folderPath.replace(/\/$/, '');
    
    // Check Cache to prevent GitHub API Rate Limiting
    const cacheKey = `sv_dir_${folderPath}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
        const apiUrl = `https://api.github.com/repos/${REPO_PATH}/contents/${folderPath}`;
        const res = await fetch(apiUrl);
        if (!res.ok) return []; // Folder not found or empty
        
        const data = await res.json();
        // Extract filenames and reconstruct the local path
        const files = data.filter(item => item.type === 'file').map(item => `${folderPath}/${item.name}`);
        
        sessionStorage.setItem(cacheKey, JSON.stringify(files));
        return files;
    } catch (e) {
        console.error(`Failed to scan folder: ${folderPath}`, e);
        return [];
    }
}

// 3. RENDER UI GRID
function renderGrid(containerId, products) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    // --- EMPTY STATE LOGIC ---
    if (products.length === 0) {
        let emptyMessage = "New assets arriving soon. Stay tuned.";
        
        if (containerId === 'premium-product-grid') {
            emptyMessage = "Premium collection currently in development. Check back soon.";
        } else if (containerId === 'free-product-grid') {
            emptyMessage = "Free resources are currently being updated. Check back soon.";
        }

        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-16 opacity-70">
                <svg class="w-12 h-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                <p class="text-slate-400 font-mono text-sm tracking-wide text-center uppercase">${emptyMessage}</p>
            </div>`;
        return;
    }

    // --- PRODUCT GENERATION LOOP (You accidentally deleted this part!) ---
    grid.innerHTML = products.map(product => {
        const isPremium = product.type.toLowerCase() === 'premium';
        let mediaHtml = '';

        // UI Tagging
        const badgeHtml = isPremium 
            ? `<div class="absolute top-4 right-4 z-30 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                 <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l5 5-5 11-5-11 5-5z"/></svg> PREMIUM
               </div>`
            : `<div class="absolute top-4 right-4 z-30 bg-white/10 text-white text-[9px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wider mono backdrop-blur-md">
                 FREE
               </div>`;

        // BUILD MEDIA CONTAINER (Video takes priority, else images, else fallback)
        if (product.videos && product.videos.length > 0) {
            // Render Premium Custom Video Player
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
            // Render Image Hover Slider
            const imageTags = product.images.map((img, index) => 
                `<img src="${img}" alt="${product.title}" class="slider-img ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'} absolute inset-0 w-full h-full object-cover transition-opacity duration-700">`
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
            // Fallback No Media
            mediaHtml = `<div class="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 text-xs mono">NO MEDIA FOUND</div>`;
        }

        return `
            <a href="item?id=${product.id}" class="premium-glass-card block group flex flex-col h-full bg-[rgba(255,255,255,0.02)] backdrop-blur-[24px] border border-white/5 rounded-2xl overflow-hidden transition-all duration-400 hover:border-white/20 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer">
                <div class="card-media relative w-full h-56 bg-black border-b border-white/5 flex-shrink-0">
                    ${mediaHtml}
                    ${badgeHtml}
                    <div class="absolute top-4 left-4 z-30 bg-black/60 text-slate-200 text-[9px] font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-widest backdrop-blur-md pointer-events-none">
                        ${product.tag}
                    </div>
                </div>
                <div class="p-6 flex flex-col flex-1">
                    <h2 class="text-xl font-bold text-white mb-2 tracking-tight">${product.title}</h2>
                    <p class="text-sm text-slate-400 mb-6 flex-1 font-light leading-relaxed">
                        ${product.description}
                    </p>
                    <div class="flex items-center justify-between border-t border-white/10 pt-5 mt-auto">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Price</span>
                            <span class="text-xl font-bold ${isPremium ? 'text-blue-400' : 'text-white'} mono">${product.price}</span>
                        </div>
                        <a href="${product.checkoutUrl}" class="lemonsqueezy-button bg-white text-black font-bold rounded px-6 py-2 text-sm transition-transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                            ${isPremium ? 'Buy Now' : 'Download'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join(''); // --- END OF PRODUCT GENERATION LOOP ---
}

// 4. LOGIC: MULTI-IMAGE HOVER
function initImageSliders() {
    document.querySelectorAll('.slider-container').forEach(container => {
        const imageCount = parseInt(container.getAttribute('data-images'));
        if (imageCount <= 1) return; 

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
            }, 1500); 
        });

        container.addEventListener('mouseleave', () => {
            clearInterval(interval);
            images[currentIndex].classList.remove('opacity-100', 'z-10');
            images[currentIndex].classList.add('opacity-0', 'z-0');
            currentIndex = 0;
            images[0].classList.remove('opacity-0', 'z-0');
            images[0].classList.add('opacity-100', 'z-10');
        });
    });
}

// 5. LOGIC: CUSTOM VIDEO PLAYER
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

        // Play/Pause Logic
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

        // Mute/Unmute Logic
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

        // Progress Bar Update
        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percent}%`;
        });

        // Click to seek
        progressContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });

        // Fullscreen
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.requestFullscreen) video.requestFullscreen();
            else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
        });
    });
}

document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);
