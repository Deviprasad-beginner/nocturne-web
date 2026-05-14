import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface FeaturedCardProps {
    title?: string;
    subtitle?: string;
    image: string;
    showPlayIcon?: boolean;
    onClick?: () => void;
    className?: string;
}

export function FeaturedCard({
    title,
    subtitle,
    image,
    showPlayIcon,
    onClick,
    className,
}: FeaturedCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative group overflow-hidden rounded-2xl cursor-pointer bg-black/20 border border-white/5",
                "h-[180px] w-full transition-all duration-500 hover:border-white/20 hover:shadow-lg",
                className
            )}
        >
            {/* Background Image */}
            <img
                src={image}
                alt={title || "Featured"}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
                {showPlayIcon && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-colors">
                        <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                )}
                
                {title && (
                    <h3 className="text-xl font-medium text-white mb-1 drop-shadow-md">
                        {title}
                    </h3>
                )}
                {subtitle && (
                    <p className="text-xs text-white/70 drop-shadow-md">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
