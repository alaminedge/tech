class UniversalVideoPlayer {
    constructor(container) {
        this.container = container;
        this.videoId = container.getAttribute('data-video-id');
        this.player = null;
        this.isPlaying = false;
        this.isPaused = true;
        this.duration = 0;
        this.currentTime = 0;
        this.volume = 75;
        this.isMuted = false;
        this.controlsTimeout = null;
        
        if (!this.videoId) {
            console.error('No data-video-id attribute found on:', container);
            return;
        }
        
        this.init();
    }
    
    init() {
        this.createPlayerStructure();
        this.initElements();
        this.setupEventListeners();
        this.setupSecurity();
        this.loadYouTubeAPI();
    }
    
    createPlayerStructure() {
        this.container.innerHTML = `
            <div class="uvp-container">
                <div class="uvp-player" id="uvp-player-${this.videoId}"></div>
                <div class="uvp-overlay">
                    <div class="uvp-play-overlay">▶</div>
                </div>
                <div class="uvp-controls">
                    <button class="uvp-control-btn uvp-play-pause">
                        <span class="uvp-play-icon">▶</span>
                        <span class="uvp-pause-icon" style="display: none;">❚❚</span>
                    </button>
                    <span class="uvp-current-time">0:00</span>
                    <div class="uvp-progress-area">
                        <div class="uvp-progress-filled"></div>
                        <div class="uvp-progress-thumb"></div>
                    </div>
                    <span class="uvp-total-time">0:00</span>
                    <button class="uvp-control-btn uvp-volume-btn">🔊</button>
                    <input type="range" class="uvp-volume-slider" min="0" max="100" value="75">
                    <button class="uvp-control-btn uvp-fullscreen-btn">⛶</button>
                </div>
            </div>
        `;
        
        this.container.className = 'universal-video-player';
    }
    
    initElements() {
        this.playerEl = this.container.querySelector('.uvp-container');
        this.playPauseBtn = this.container.querySelector('.uvp-play-pause');
        this.playIcon = this.container.querySelector('.uvp-play-icon');
        this.pauseIcon = this.container.querySelector('.uvp-pause-icon');
        this.overlay = this.container.querySelector('.uvp-overlay');
        this.playOverlay = this.container.querySelector('.uvp-play-overlay');
        this.currentTimeEl = this.container.querySelector('.uvp-current-time');
        this.totalTimeEl = this.container.querySelector('.uvp-total-time');
        this.progressArea = this.container.querySelector('.uvp-progress-area');
        this.progressFilled = this.container.querySelector('.uvp-progress-filled');
        this.progressThumb = this.container.querySelector('.uvp-progress-thumb');
        this.volumeBtn = this.container.querySelector('.uvp-volume-btn');
        this.volumeSlider = this.container.querySelector('.uvp-volume-slider');
        this.fullscreenBtn = this.container.querySelector('.uvp-fullscreen-btn');
        this.controlsBar = this.container.querySelector('.uvp-controls');
    }
    
    loadYouTubeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = () => this.initializeAllPlayers();
        } else {
            setTimeout(() => this.initializePlayer(), 100);
        }
    }
    
    initializePlayer() {
        const playerId = `uvp-player-${this.videoId}`;
        
        this.player = new YT.Player(playerId, {
            height: '100%',
            width: '100%',
            videoId: this.videoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin
            },
            events: {
                onReady: (event) => this.onPlayerReady(event),
                onStateChange: (event) => this.onPlayerStateChange(event),
                onError: (event) => this.onPlayerError(event)
            }
        });
    }
    
    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.overlay.addEventListener('click', () => this.togglePlayPause());
        
        this.progressArea.addEventListener('click', (e) => this.seekToPosition(e));
        this.progressThumb.addEventListener('mousedown', (e) => this.startProgressDrag(e));
        
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(parseInt(e.target.value)));
        
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.container.addEventListener('mousemove', () => this.showControls());
        this.container.addEventListener('mouseleave', () => this.hideControls());
    }
    
    setupSecurity() {
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    onPlayerReady(event) {
        this.duration = this.player.getDuration();
        this.totalTimeEl.textContent = this.formatTime(this.duration);
        this.setVolume(this.volume);
        this.startUpdateLoop();
    }
    
    onPlayerStateChange(event) {
        const state = event.data;
        if (state === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.isPaused = false;
            this.updatePlayButton();
            this.overlay.style.display = 'none';
        } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.isPaused = true;
            this.updatePlayButton();
            this.overlay.style.display = 'flex';
        }
    }
    
    onPlayerError(event) {
        console.error('Player error:', event.data);
    }
    
    startUpdateLoop() {
        setInterval(() => {
            if (this.player && this.isPlaying) {
                this.currentTime = this.player.getCurrentTime();
                const progress = (this.currentTime / this.duration) * 100;
                this.progressFilled.style.width = `${progress}%`;
                this.progressThumb.style.left = `${progress}%`;
                this.currentTimeEl.textContent = this.formatTime(this.currentTime);
            }
        }, 100);
    }
    
    togglePlayPause() {
        if (!this.player) return;
        this.isPlaying ? this.player.pauseVideo() : this.player.playVideo();
    }
    
    updatePlayButton() {
        this.playIcon.style.display = this.isPlaying ? 'none' : 'inline';
        this.pauseIcon.style.display = this.isPlaying ? 'inline' : 'none';
    }
    
    seekToPosition(event) {
        if (!this.player) return;
        const rect = this.progressArea.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = (clickX / rect.width) * 100;
        const seekTime = (percentage / 100) * this.duration;
        this.player.seekTo(seekTime, true);
    }
    
    startProgressDrag(event) {
        event.preventDefault();
        const handleMouseMove = (e) => {
            const rect = this.progressArea.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;
            const seekTime = (percentage / 100) * this.duration;
            this.player.seekTo(seekTime, true);
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    setVolume(volume) {
        this.volume = volume;
        this.volumeSlider.value = volume;
        if (this.player) this.player.setVolume(volume);
        this.updateVolumeIcon();
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.player.setVolume(this.isMuted ? 0 : this.volume);
        this.updateVolumeIcon();
    }
    
    updateVolumeIcon() {
        const volume = this.isMuted ? 0 : this.volume;
        if (volume === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (volume < 30) {
            this.volumeBtn.textContent = '🔈';
        } else if (volume < 70) {
            this.volumeBtn.textContent = '🔉';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    }
    
    showControls() {
        this.controlsBar.style.opacity = '1';
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = setTimeout(() => this.hideControls(), 3000);
    }
    
    hideControls() {
        if (this.isPlaying) {
            this.controlsBar.style.opacity = '0';
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Global Styles (injected once)
if (!document.querySelector('#uvp-styles')) {
    const styles = document.createElement('style');
    styles.id = 'uvp-styles';
    styles.innerHTML = `
        .universal-video-player {
            position: relative;
            width: 100%;
            aspect-ratio: 16/9;
            background: #000;
            border-radius: 8px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .uvp-container {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .uvp-player {
            width: 100%;
            height: 100%;
        }
        
        .uvp-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
            transition: opacity 0.3s;
        }
        
        .uvp-play-overlay {
            font-size: 60px;
            color: white;
            opacity: 0.8;
            transition: opacity 0.3s;
        }
        
        .uvp-overlay:hover .uvp-play-overlay {
            opacity: 1;
        }
        
        .uvp-controls {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.8));
            padding: 15px 10px 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: opacity 0.3s;
            z-index: 20;
            opacity: 0;
        }
        
        .universal-video-player:hover .uvp-controls {
            opacity: 1;
        }
        
        .uvp-control-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .uvp-control-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .uvp-current-time, .uvp-total-time {
            color: white;
            font-size: 12px;
            font-family: Arial, sans-serif;
            min-width: 35px;
        }
        
        .uvp-progress-area {
            flex: 1;
            height: 4px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            cursor: pointer;
            position: relative;
        }
        
        .uvp-progress-filled {
            height: 100%;
            background: #ff0000;
            border-radius: 2px;
            width: 0%;
            transition: width 0.1s;
        }
        
        .uvp-progress-thumb {
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            background: #ff0000;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .uvp-progress-area:hover .uvp-progress-thumb {
            opacity: 1;
        }
        
        .uvp-volume-slider {
            width: 60px;
            height: 3px;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
        }
        
        .uvp-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 10px;
            background: #fff;
            border-radius: 50%;
            cursor: pointer;
        }
        
        /* Hide YouTube elements */
        .ytp-chrome-top, .ytp-chrome-bottom, .ytp-chrome-controls,
        .ytp-gradient-top, .ytp-gradient-bottom, .ytp-watermark,
        .ytp-title, .ytp-pause-overlay, .ytp-ce-element,
        .ytp-endscreen-element, .iv-branding, .annotation,
        .ytp-paid-content-overlay, .ytp-ad-overlay-container {
            display: none !important;
        }
    `;
    document.head.appendChild(styles);
}

// Auto-initialize all players
function initializeAllPlayers() {
    const players = document.querySelectorAll('[data-video-id]');
    players.forEach(container => {
        if (!container._playerInstance) {
            container._playerInstance = new UniversalVideoPlayer(container);
        }
    });
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllPlayers);
} else {
    initializeAllPlayers();
}

// Re-initialize when new players are added (for dynamic content)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-video-id')) {
                node._playerInstance = new UniversalVideoPlayer(node);
            }
        });
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Global function for manual initialization
window.createVideoPlayer = function(container, videoId) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    container.setAttribute('data-video-id', videoId);
    return new UniversalVideoPlayer(container);
};
