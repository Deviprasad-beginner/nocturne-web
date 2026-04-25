/**
 * YouTube Player Integration
 * Replaces audioEngine.ts to support YouTube URLs
 */

export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string; // YouTube URL
    mood: string;
    coverArt?: string;
}

type PlayerEventCallback = (data?: any) => void;

// Helper to extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

class YouTubePlayerManager {
    private player: any = null;
    private currentTrack: Track | null = null;
    private listeners: Map<string, Set<PlayerEventCallback>> = new Map();
    private isReady = false;
    private volume = 50; // 0-100
    private pendingPlay: Track | null = null;

    constructor() {
        this.loadYouTubeAPI();
    }

    private loadYouTubeAPI() {
        if (typeof window === 'undefined') return;

        // Check if API already loaded
        if ((window as any).YT && (window as any).YT.Player) {
            this.initPlayer();
            return;
        }

        // Load YouTube IFrame API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // Global callback when API is ready
        (window as any).onYouTubeIframeAPIReady = () => {
            this.initPlayer();
            if (this.pendingPlay) {
                this.play(this.pendingPlay);
            }
        };
    }

    private initPlayer() {
        if (typeof window === 'undefined') return;

        // Create hidden iframe container
        let container = document.getElementById('yt-player-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'yt-player-container';
            container.style.display = 'none';
            document.body.appendChild(container);
        }

        this.player = new (window as any).YT.Player('yt-player-container', {
            height: '0',
            width: '0',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
            },
            events: {
                onReady: () => {
                    this.isReady = true;
                    this.player.setVolume(this.volume);
                    this.emit('ready');
                },
                onStateChange: (event: any) => this.onPlayerStateChange(event),
                onError: (event: any) => this.emit('error', { error: event.data }),
            },
        });

        // Update progress
        setInterval(() => {
            if (this.player && this.isReady && this.player.getPlayerState() === 1) {
                this.emit('timeupdate', {
                    currentTime: this.player.getCurrentTime(),
                    duration: this.player.getDuration(),
                });
            }
        }, 1000);
    }

    private onPlayerStateChange(event: any) {
        const states = (window as any).YT.PlayerState;
        switch (event.data) {
            case states.PLAYING:
                this.emit('play', this.currentTrack);
                break;
            case states.PAUSED:
                this.emit('pause');
                break;
            case states.ENDED:
                this.emit('ended');
                break;
            case states.BUFFERING:
                this.emit('buffering');
                break;
        }
    }

    async play(track: Track): Promise<void> {
        if (!this.isReady || !this.player) {
            this.pendingPlay = track;
            return;
        }

        const videoId = extractYouTubeId(track.url);
        if (!videoId) {
            console.error('Invalid YouTube URL:', track.url);
            this.emit('error', { error: 'Invalid YouTube URL' });
            return;
        }

        try {
            // If same track, just resume
            if (this.currentTrack?.id === track.id) {
                this.player.playVideo();
                return;
            }

            // Load new video
            this.currentTrack = track;
            this.player.loadVideoById(videoId);
            this.emit('loadedmetadata', { duration: 0 }); // Will update when ready
        } catch (error) {
            console.error('YouTube playback failed:', error);
            this.emit('error', { error });
        }
    }

    pause(): void {
        if (this.player && this.isReady) {
            this.player.pauseVideo();
        }
    }

    resume(): void {
        if (this.player && this.isReady) {
            this.player.playVideo();
        }
    }

    stop(): void {
        if (this.player && this.isReady) {
            this.player.stopVideo();
            this.currentTrack = null;
            this.emit('stop');
        }
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.player && this.isReady) {
            this.player.setVolume(this.volume);
        }
        this.emit('volumechange', { volume: this.volume / 100 });
    }

    seek(time: number): void {
        if (this.player && this.isReady) {
            this.player.seekTo(time, true);
            this.emit('seek', { time });
        }
    }

    getState() {
        if (!this.player || !this.isReady) {
            return {
                isPlaying: false,
                currentTime: 0,
                duration: 0,
                volume: this.volume / 100,
                track: null,
            };
        }

        const state = this.player.getPlayerState();
        const isPlaying = state === 1; // YT.PlayerState.PLAYING

        return {
            isPlaying,
            currentTime: this.player.getCurrentTime() || 0,
            duration: this.player.getDuration() || 0,
            volume: this.volume / 100,
            track: this.currentTrack,
        };
    }

    on(event: string, callback: PlayerEventCallback): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    off(event: string, callback: PlayerEventCallback): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    private emit(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach((callback) => callback(data));
        }
    }
}

// Export singleton instance
export const youtubePlayer = new YouTubePlayerManager();
export { extractYouTubeId };
