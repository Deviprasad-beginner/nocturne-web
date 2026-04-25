import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

/**
 * Props for ConfirmDialog component
 */
export interface ConfirmDialogProps {
    /** Controls dialog visibility */
    open: boolean;
    /** Callback when dialog visibility changes */
    onOpenChange: (open: boolean) => void;
    /** Callback when user confirms action */
    onConfirm: () => void | Promise<void>;
    /** Dialog title */
    title: string;
    /** Dialog description/message */
    description: string;
    /** Text for confirm button (default: "Continue") */
    confirmText?: string;
    /** Text for cancel button (default: "Cancel") */
    cancelText?: string;
    /** Visual variant (default: "default") */
    variant?: 'default' | 'destructive';
    /** Show loading state during async confirm */
    isLoading?: boolean;
}

/**
 * Accessible confirmation dialog component
 * 
 * Features:
 * - Keyboard navigation (Enter to confirm, Esc to cancel)
 * - ARIA labels for screen readers
 * - Focus management
 * - Loading state support
 * - Destructive action variant
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   onConfirm={handleDelete}
 *   title="Delete Entry"
 *   description="This action cannot be undone. Are you sure?"
 *   variant="destructive"
 *   confirmText="Delete"
 * />
 * ```
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = "Continue",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                className="bg-gray-800 border-gray-700"
                aria-describedby="confirm-dialog-description"
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white text-xl">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription
                        id="confirm-dialog-description"
                        className="text-gray-300 text-base leading-relaxed"
                    >
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel
                        className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={
                            variant === "destructive"
                                ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
                                : "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"
                        }
                        aria-label={`${confirmText} action`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
