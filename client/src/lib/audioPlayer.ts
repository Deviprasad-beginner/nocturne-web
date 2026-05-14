/**
 * HTML5 Audio Player Integration
 * Replaces youtubePlayer.ts to support native audio URLs (like Jamendo)
 */

export interface Track {
    id: string | number;
    title: string;
    artist: string;
    url: string; // Audio stream URL
    mood: string;
    coverArt?: string;
}

type PlayerEventCallback = (data?: any) => void;

class AudioPlayerManager {
    private audio: HTMLAudioElement | null = null;
    private currentTrack: Track | null = null;
    private listeners: Map<string, Set<PlayerEventCallback>> = new Map();
    private volume = 50; // 0-100

    constructor() {
        // We defer initialization until the first play() to ensure it happens 
        // within a user gesture, bypassing strict browser autoplay policies.
    }

    private initAudio() {
        if (!this.audio && typeof window !== 'undefined') {
            this.audio = document.createElement('audio');
            this.audio.id = 'nocturne-audio-player';
            this.audio.style.display = 'none';
            this.audio.preload = 'auto';
            document.body.appendChild(this.audio);
            this.setupEventListeners();
        }
    }

    private setupEventListeners() {
        if (!this.audio) return;
        
        this.audio.addEventListener('play', () => this.emit('play', this.currentTrack));
        this.audio.addEventListener('playing', () => this.emit('play', this.currentTrack));
        this.audio.addEventListener('pause', () => this.emit('pause'));
        this.audio.addEventListener('ended', () => this.emit('ended'));
        this.audio.addEventListener('waiting', () => this.emit('buffering'));
        
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio && !isNaN(this.audio.currentTime)) {
                this.emit('timeupdate', {
                    currentTime: this.audio.currentTime,
                    duration: isNaN(this.audio.duration) ? 0 : this.audio.duration
                });
            }
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            if (this.audio) {
                this.emit('loadedmetadata', { duration: isNaN(this.audio.duration) ? 0 : this.audio.duration });
            }
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error("Audio Element Error:", this.audio?.error);
            this.emit('error', { error: this.audio?.error });
        });
    }

    async play(track: Track): Promise<void> {
        this.initAudio();
        if (!this.audio) return;

        try {
            // If same track, just resume
            if (this.currentTrack?.id === track.id) {
                await this.audio.play();
                return;
            }

            // Load new track
            this.currentTrack = track;
            this.audio.src = track.url;
            this.audio.load(); // Explicitly load
            this.audio.volume = this.volume / 100;
            
            // Wait for it to be ready enough to play
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                await playPromise;
            }
        } catch (error) {
            console.error('Audio playback failed:', error);
            this.emit('error', { error });
        }
    }

    pause(): void {
        if (this.audio) {
            this.audio.pause();
        }
    }

    resume(): void {
        if (this.audio) {
            this.audio.play().catch(e => console.error("Resume failed", e));
        }
    }

    stop(): void {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.currentTrack = null;
            this.emit('stop');
        }
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.audio) {
            this.audio.volume = this.volume / 100;
        }
        this.emit('volumechange', { volume: this.volume / 100 });
    }

    seek(time: number): void {
        if (this.audio && isFinite(time)) {
            this.audio.currentTime = time;
            this.emit('seek', { time });
        }
    }

    getState() {
        if (!this.audio) {
            return {
                isPlaying: false,
                currentTime: 0,
                duration: 0,
                volume: this.volume / 100,
                track: null,
            };
        }

        return {
            isPlaying: !this.audio.paused,
            currentTime: this.audio.currentTime || 0,
            duration: this.audio.duration || 0,
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
export const audioPlayer = new AudioPlayerManager();
