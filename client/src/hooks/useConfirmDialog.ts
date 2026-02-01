import { useState, useCallback } from 'react';

/**
 * Configuration for confirmation dialog
 */
export interface ConfirmDialogConfig {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

/**
 * Return type for useConfirmDialog hook
 */
export interface UseConfirmDialogReturn {
    isOpen: boolean;
    config: ConfirmDialogConfig | null;
    confirm: (config: ConfirmDialogConfig) => Promise<boolean>;
    handleConfirm: () => void;
    handleCancel: () => void;
}

/**
 * Custom hook for managing confirmation dialogs
 * 
 * @example
 * ```tsx
 * const confirmDialog = useConfirmDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirmDialog.confirm({
 *     title: 'Delete Entry',
 *     description: 'This action cannot be undone.',
 *     variant: 'destructive'
 *   });
 *   
 *   if (confirmed) {
 *     // Perform delete
 *   }
 * };
 * ```
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ConfirmDialogConfig | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    /**
     * Opens the confirmation dialog and returns a promise
     * that resolves to true if confirmed, false if cancelled
     */
    const confirm = useCallback((dialogConfig: ConfirmDialogConfig): Promise<boolean> => {
        setConfig(dialogConfig);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    /**
     * Handles confirmation - resolves promise with true
     */
    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(true);
        }
        setConfig(null);
        setResolvePromise(null);
    }, [resolvePromise]);

    /**
     * Handles cancellation - resolves promise with false
     */
    const handleCancel = useCallback(() => {
        setIsOpen(false);
        if (resolvePromise) {
            resolvePromise(false);
        }
        setConfig(null);
        setResolvePromise(null);
    }, [resolvePromise]);

    return {
        isOpen,
        config,
        confirm,
        handleConfirm,
        handleCancel,
    };
}
