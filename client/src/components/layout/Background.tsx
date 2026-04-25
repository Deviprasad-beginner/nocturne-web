import { useEffect, useRef } from "react";

export function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number }> = [];
        let width = window.innerWidth;
        let height = window.innerHeight;

        const initStars = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            const starCount = Math.floor((width * height) / 2000); // Responsive star density
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

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Create rich dark gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, "#020617"); // slate-950 (Deep night sky)
            gradient.addColorStop(0.5, "#0f172a"); // slate-900 
            gradient.addColorStop(1, "#1e1b4b"); // indigo-950 (Deep Purple horizon)

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw stars
            ctx.fillStyle = "white";
            stars.forEach((star) => {
                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();

                // Twinkle effect
                star.alpha += star.speed;
                if (star.alpha > 1 || star.alpha < 0.2) {
                    star.speed = -star.speed;
                }
            });

            // Floating Orbs / Fireflies (Subtle)
            const time = Date.now() * 0.001;
            for (let i = 0; i < 5; i++) {
                const x = width * (0.5 + 0.4 * Math.sin(time * 0.5 + i));
                const y = height * (0.6 + 0.2 * Math.cos(time * 0.3 + i * 2));

                const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
                orbGradient.addColorStop(0, "rgba(99, 102, 241, 0.15)"); // Indigo glow
                orbGradient.addColorStop(1, "rgba(99, 102, 241, 0)");

                ctx.fillStyle = orbGradient;
                ctx.fillRect(0, 0, width, height);
            }

            // Northern Lights / Nebula effect (very subtle overlay)
            const nebulaGradient = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.2, height * 0.2, width * 0.8);
            nebulaGradient.addColorStop(0, "rgba(76, 29, 149, 0.03)"); // faint purple
            nebulaGradient.addColorStop(1, "transparent");
            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(0, 0, width, height);


            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            initStars();
        };

        initStars();
        draw();

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10"
        />
    );
}
