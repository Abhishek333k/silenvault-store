/**
 * SilenVault Digital Store - Dynamic Engine
 * Features: Interactive Sliders, Custom Video Player
 */

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

document.addEventListener('DOMContentLoaded', () => {
    initImageSliders();
    initCustomVideoPlayers();
});
