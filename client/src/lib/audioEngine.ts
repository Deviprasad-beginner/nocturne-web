/**
 * Audio Engine - Singleton class for managing HTML5 Audio playback
 * Provides centralized audio control with event handling
 */

export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    mood: string;
    coverArt?: string;
}

type AudioEventCallback = (data?: any) => void;

class AudioEngineClass {
    private audio: HTMLAudioElement | null = null;
    private currentTrack: Track | null = null;
    private listeners: Map<string, Set<AudioEventCallback>> = new Map();

    constructor() {
        this.initAudio();
    }

    private initAudio() {
        if (typeof window === 'undefined') return;

        this.audio = new Audio();
        this.audio.preload = 'metadata';

        // Attach event listeners
        this.audio.addEventListener('timeupdate', () => {
            this.emit('timeupdate', {
                currentTime: this.audio!.currentTime,
                duration: this.audio!.duration,
            });
        });

        this.audio.addEventListener('ended', () => {
            this.emit('ended');
        });

        this.audio.addEventListener('error', (e) => {
            this.emit('error', { error: e });
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.emit('loadedmetadata', {
                duration: this.audio!.duration,
            });
        });

        this.audio.addEventListener('canplay', () => {
            this.emit('canplay');
        });
    }

    /**
     * Play a new track
     */
    async play(track: Track): Promise<void> {
        if (!this.audio) return;

        try {
            // If same track, just resume
            if (this.currentTrack?.id === track.id && this.audio.paused) {
                await this.audio.play();
                this.emit('play', track);
                return;
            }

            // Load new track
            this.currentTrack = track;
            this.audio.src = track.url;
            this.audio.load();
            await this.audio.play();
            this.emit('play', track);
        } catch (error) {
            console.error('Audio playback failed:', error);
            this.emit('error', { error });
        }
    }

    /**
     * Pause playback
     */
    pause(): void {
        if (!this.audio) return;
        this.audio.pause();
        this.emit('pause');
    }

    /**
     * Resume playback
     */
    async resume(): Promise<void> {
        if (!this.audio) return;
        try {
            await this.audio.play();
            this.emit('resume');
        } catch (error) {
            console.error('Resume failed:', error);
            this.emit('error', { error });
        }
    }

    /**
     * Stop playback and reset
     */
    stop(): void {
        if (!this.audio) return;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.currentTrack = null;
        this.emit('stop');
    }

    /**
     * Set volume (0-1)
     */
    setVolume(volume: number): void {
        if (!this.audio) return;
        this.audio.volume = Math.max(0, Math.min(1, volume));
        this.emit('volumechange', { volume: this.audio.volume });
    }

    /**
     * Seek to specific time (in seconds)
     */
    seek(time: number): void {
        if (!this.audio) return;
        this.audio.currentTime = time;
        this.emit('seek', { time });
    }

    /**
     * Get current playback state
     */
    getState() {
        if (!this.audio) {
            return {
                isPlaying: false,
                currentTime: 0,
                duration: 0,
                volume: 0.5,
                track: null,
            };
        }

        return {
            isPlaying: !this.audio.paused,
            currentTime: this.audio.currentTime,
            duration: this.audio.duration || 0,
            volume: this.audio.volume,
            track: this.currentTrack,
        };
    }

    /**
     * Subscribe to audio events
     */
    on(event: string, callback: AudioEventCallback): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    /**
     * Unsubscribe from audio events
     */
    off(event: string, callback: AudioEventCallback): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(callback);
        }
    }

    /**
     * Emit events to subscribers
     */
    private emit(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach((callback) => callback(data));
        }
    }
}

// Export singleton instance
export const audioEngine = new AudioEngineClass();
