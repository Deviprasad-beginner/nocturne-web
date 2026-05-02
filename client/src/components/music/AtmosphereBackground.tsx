export function AtmosphereBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            {/* Deep base */}
            <div className="absolute inset-0 bg-[#06060a]" />
            {/* Subtle radial glow — top centre */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(88,80,140,0.18) 0%, transparent 70%)",
                }}
            />
            {/* Low warm glow — bottom right */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 40% at 85% 110%, rgba(60,50,100,0.12) 0%, transparent 65%)",
                }}
            />
        </div>
    );
}
