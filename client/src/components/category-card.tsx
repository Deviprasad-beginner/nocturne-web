import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  count: number;
  countLabel: string;
  countColor: string;
  children: React.ReactNode;
  onClick?: () => void;
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
}: CategoryCardProps) {
  return (
    <Card
      className="category-card glassmorphism p-8 rounded-3xl cursor-pointer hover:translate-y-[-8px] transition-all duration-300"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 ${iconColor} rounded-2xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xs ${countColor} px-3 py-1 rounded-full`}>
            {count} {countLabel}
          </span>
        </div>
        <h4 className="text-xl font-semibold mb-3">{title}</h4>
        <p className="text-gray-400 mb-6">{description}</p>
        {children}
      </CardContent>
    </Card>
  );
}
