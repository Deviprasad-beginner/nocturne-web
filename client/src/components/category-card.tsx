import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  count: number | string;
  countLabel: string;
  countColor: string;
  children: React.ReactNode;
  onClick?: () => void;
  isLocked?: boolean;
  unlockHint?: string;
  glow?: boolean;
}

export function CategoryCard({
  title,
  description,
  icon: Icon,
  iconColor,
  count,
  countLabel,
  countColor,
  children,
  onClick,
  isLocked = false,
  unlockHint,
  glow = false,
}: CategoryCardProps) {
  return (
    <Card
      className={`category-card glassmorphism p-8 rounded-3xl transition-all duration-300 relative overflow-hidden
        ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:translate-y-[-8px]'}
        ${glow ? 'ring-1 ring-indigo-500/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]' : ''}
      `}
      onClick={isLocked ? undefined : onClick}
      title={isLocked ? "This area is currently locked. Explore the active zones to unlock more." : title}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-black/60 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <span className="text-gray-400 text-xs uppercase tracking-widest font-medium">Locked</span>
            </div>
            {unlockHint && (
              <p className="text-gray-300 text-xs text-center max-w-[200px] font-light bg-black/40 px-3 py-1 rounded-md backdrop-blur-md">
                {unlockHint}
              </p>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 ${isLocked ? 'bg-gray-800' : iconColor} rounded-2xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${isLocked ? 'text-gray-500' : 'text-white'}`} />
          </div>
          <span className={`text-xs ${isLocked ? 'bg-gray-800 text-gray-500' : countColor} px-3 py-1 rounded-full`}>
            {count} {countLabel}
          </span>
        </div>
        <h4 className={`text-xl font-semibold mb-3 ${isLocked ? 'text-gray-500' : ''}`}>{title}</h4>
        <p className="text-gray-400 mb-6">{description}</p>

        <div className={isLocked ? 'opacity-30 blur-[1px]' : ''}>
          {children}
        </div>
      </CardContent>
    </Card >
  );
}
