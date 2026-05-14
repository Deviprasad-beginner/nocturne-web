import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface CategoryCardProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    image: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
}

export function CategoryCard({
    title,
    subtitle,
    icon,
    image,
    onClick,
    className,
    isActive = false,
}: CategoryCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative group overflow-hidden rounded-2xl cursor-pointer bg-black/40 border transition-all duration-500",
                "h-[140px] w-full hover:shadow-lg",
                isActive
                    ? "border-white/40 shadow-[0_0_20px_rgba(180,160,255,0.18)]"
                    : "border-white/5 hover:border-white/20",
                className
            )}
        >
            {/* Background Image */}
            <img
                src={image}
                alt={title}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
                    isActive ? "opacity-55" : "opacity-40 group-hover:opacity-60"
                )}
            />

            {/* Active glow overlay */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 via-purple-900/20 to-transparent" />
            )}

            {/* Default Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#16213e]/90 via-[#1a1a2e]/60 to-transparent group-hover:opacity-80 transition-opacity duration-500" />

            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
                {/* Top Left Icon */}
                <div className={cn("transition-colors", isActive ? "text-purple-300" : "text-white/80 group-hover:text-white")}>
                    {icon}
                </div>

                <div className="flex items-end justify-between">
                    {/* Bottom Left Text */}
                    <div>
                        <h3 className={cn(
                            "text-sm font-medium mb-0.5 group-hover:translate-x-1 transition-transform duration-300",
                            isActive ? "text-white" : "text-white"
                        )}>
                            {title}
                        </h3>
                        <p className={cn(
                            "text-[10px] group-hover:translate-x-1 transition-all duration-300",
                            isActive ? "text-purple-300/70" : "text-white/40 group-hover:text-white/60"
                        )}>
                            {subtitle}
                        </p>
                    </div>

                    {/* Bottom Right: animated equalizer when active, play pill when not */}
                    {isActive ? (
                        <div className="flex items-end gap-[3px] h-5 pr-1">
                            {[0.4, 1, 0.6, 0.8, 0.5].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-[3px] rounded-full bg-purple-300/70"
                                    style={{
                                        height: "100%",
                                        animation: `barBounce 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                                        transformOrigin: "bottom",
                                    }}
                                />
                            ))}
                            <style>{`
                                @keyframes barBounce {
                                    from { transform: scaleY(0.25); }
                                    to   { transform: scaleY(1); }
                                }
                            `}</style>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/20 transition-colors">
                            <Play className="w-3 h-3 text-white" />
                            <div className="flex gap-0.5 ml-1.5">
                                <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                                <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                                <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
