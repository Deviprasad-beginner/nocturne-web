import { useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";

export function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { backgroundTheme, customBackgroundUrl } = useSettings();

    useEffect(() => {
        if (backgroundTheme !== 'classic-stars') return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number }> = [];
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Detect mobile for performance budget
        const isMobile = width <= 768;
        // Frame throttle: mobile targets ~30fps, desktop full 60fps
        let lastFrameTime = 0;
        const frameBudget = isMobile ? 33 : 0; // ms between frames

        const initStars = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Halve star density on mobile
            const densityDivisor = isMobile ? 4000 : 2000;
            const starCount = Math.floor((width * height) / densityDivisor);
            stars = [];

            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5,
                    alpha: Math.random(),
                    speed: Math.random() * 0.05
                });
            }
        };

        const draw = (timestamp: number) => {
            // Frame throttle for mobile
            if (isMobile && timestamp - lastFrameTime < frameBudget) {
                animationFrameId = requestAnimationFrame(draw);
                return;
            }
            lastFrameTime = timestamp;

            ctx.clearRect(0, 0, width, height);

            // Dark gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#020617");
            gradient.addColorStop(0.5, "#0f172a");
            gradient.addColorStop(1, "#1e1b4b");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw stars
            ctx.fillStyle = "white";
            stars.forEach((star) => {
                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();

                star.alpha += star.speed;
                if (star.alpha > 1 || star.alpha < 0.2) {
                    star.speed = -star.speed;
                }
            });

            // Skip expensive orb radial gradients on mobile
            if (!isMobile) {
                const time = Date.now() * 0.001;
                for (let i = 0; i < 5; i++) {
                    const x = width * (0.5 + 0.4 * Math.sin(time * 0.5 + i));
                    const y = height * (0.6 + 0.2 * Math.cos(time * 0.3 + i * 2));

                    const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
                    orbGradient.addColorStop(0, "rgba(99, 102, 241, 0.15)");
                    orbGradient.addColorStop(1, "rgba(99, 102, 241, 0)");

                    ctx.fillStyle = orbGradient;
                    ctx.fillRect(0, 0, width, height);
                }

                // Nebula effect — desktop only
                const nebulaGradient = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.2, height * 0.2, width * 0.8);
                nebulaGradient.addColorStop(0, "rgba(76, 29, 149, 0.03)");
                nebulaGradient.addColorStop(1, "transparent");
                ctx.fillStyle = nebulaGradient;
                ctx.fillRect(0, 0, width, height);
            }

            ctx.globalAlpha = 1;
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            initStars();
        };

        initStars();
        animationFrameId = requestAnimationFrame(draw);

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [backgroundTheme]);

    if (backgroundTheme === 'aurora') {
        return <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-aurora opacity-70" />;
    }
    
    if (backgroundTheme === 'midnight-forest') {
        return (
            <div 
                className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-cover bg-center opacity-40" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop")' }} 
            />
        );
    }
    
    if (backgroundTheme === 'rainy-jungle') {
        return (
            <div 
                className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-cover bg-center opacity-70" 
                style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2000&auto=format&fit=crop")',
                    backgroundColor: '#0a1510' 
                }} 
            />
        );
    }
    
    if (backgroundTheme === 'solid-black') {
        return <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-black" />;
    }
    
    if (backgroundTheme === 'custom' && customBackgroundUrl) {
        return (
            <div 
                className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-cover bg-center opacity-50" 
                style={{ backgroundImage: `url("${customBackgroundUrl}")` }} 
            />
        );
    }

    // Default fallback to classic-stars
    return (
        <canvas
            ref={canvasRef}
            className={`fixed top-0 left-0 w-full h-full pointer-events-none -z-10 ${backgroundTheme !== 'classic-stars' ? 'hidden' : ''}`}
        />
    );
}

