import { cn } from "@/lib/utils";

/**
 * Props for CharacterCounter component
 */
export interface CharacterCounterProps {
    /** Current character count */
    current: number;
    /** Maximum allowed characters */
    max: number;
    /** Minimum required characters (optional) */
    min?: number;
    /** Additional CSS classes */
    className?: string;
    /** Show error state when over limit */
    showError?: boolean;
}

/**
 * Displays character count with visual feedback
 * 
 * Features:
 * - Color-coded feedback (gray → yellow → red)
 * - Accessibility with aria-live
 * - Warning at 90% capacity
 * - Error state when over limit
 * 
 * @example
 * ```tsx
 * <CharacterCounter
 *   current={content.length}
 *   max={500}
 *   min={10}
 *   showError={true}
 * />
 * ```
 */
export function CharacterCounter({
    current,
    max,
    min,
    className,
    showError = true,
}: CharacterCounterProps) {
    const remaining = max - current;
    const percentage = current / max;
    const isOverLimit = current > max;
    const isUnderMin = min !== undefined && current < min && current > 0;
    const isNearLimit = percentage >= 0.9 && !isOverLimit;

    // Determine color based on state
    const getColor = () => {
        if (isOverLimit && showError) return "text-red-400";
        if (isNearLimit) return "text-yellow-400";
        if (isUnderMin && showError) return "text-orange-400";
        return "text-gray-400";
    };

    // Screen reader announcement
    const getAriaLabel = () => {
        if (isOverLimit) {
            return `Over character limit by ${Math.abs(remaining)} characters`;
        }
        if (isUnderMin) {
            return `${min! - current} more characters required`;
        }
        return `${remaining} characters remaining`;
    };

    return (
        <div
            className={cn("flex items-center justify-between text-sm", className)}
            aria-live="polite"
            aria-label={getAriaLabel()}
        >
            <span className={getColor()}>
                {isOverLimit ? (
                    <>
                        <span className="font-medium">Over limit by {Math.abs(remaining)}</span>
                    </>
                ) : isUnderMin ? (
                    <>
                        <span className="font-medium">{min! - current} more needed</span>
                    </>
                ) : (
                    <>
                        <span className="font-medium">{current}</span>
                        <span className="text-gray-500"> / {max}</span>
                    </>
                )}
            </span>

            {isNearLimit && !isOverLimit && (
                <span className="text-xs text-yellow-400">Almost at limit</span>
            )}
        </div>
    );
}
