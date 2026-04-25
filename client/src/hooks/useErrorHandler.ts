import { useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info';

/**
 * Structured error information
 */
export interface AppError {
    message: string;
    code?: string;
    severity: ErrorSeverity;
    retryable?: boolean;
}

/**
 * User-friendly error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
    // Network errors
    NETWORK_ERROR: 'Connection lost. Please check your internet and try again.',
    TIMEOUT: 'Request timed out. Please try again.',

    // Auth errors
    UNAUTHORIZED: 'Please log in to perform this action.',
    FORBIDDEN: 'You don\'t have permission to do this.',

    // Resource errors
    NOT_FOUND: 'This content no longer exists.',
    CONFLICT: 'This action conflicts with existing data.',

    // Rate limiting
    RATE_LIMIT: 'Too many requests. Please wait a moment.',

    // Server errors
    SERVER_ERROR: 'Something went wrong on our end. We\'re working on it.',
    BAD_REQUEST: 'Invalid request. Please check your input.',

    // Generic
    UNKNOWN: 'An unexpected error occurred.',
} as const;

/**
 * Return type for useErrorHandler hook
 */
export interface UseErrorHandlerReturn {
    handleError: (error: unknown, context?: string) => void;
    getErrorMessage: (error: unknown) => string;
}

/**
 * Custom hook for centralized error handling with user notifications
 * 
 * @example
 * ```tsx
 * const { handleError } = useErrorHandler();
 * 
 * try {
 *   await deleteEntry(id);
 * } catch (error) {
 *   handleError(error, 'Deleting diary entry');
 * }
 * ```
 */
export function useErrorHandler(): UseErrorHandlerReturn {
    const { toast } = useToast();

    /**
     * Extracts user-friendly error message from various error types
     */
    const getErrorMessage = useCallback((error: unknown): string => {
        // Handle API errors with code
        if (error && typeof error === 'object' && 'code' in error) {
            const code = (error as { code: string }).code;
            return ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN;
        }

        // Handle standard Error objects
        if (error instanceof Error) {
            // Check if it's a network error
            if (error.message.includes('fetch') || error.message.includes('network')) {
                return ERROR_MESSAGES.NETWORK_ERROR;
            }
            return error.message;
        }

        // Handle string errors
        if (typeof error === 'string') {
            return error;
        }

        return ERROR_MESSAGES.UNKNOWN;
    }, []);

    /**
     * Handles errors by logging and showing user-friendly toast
     */
    const handleError = useCallback((error: unknown, context?: string) => {
        const message = getErrorMessage(error);

        // Log to console for debugging
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);

        // Show toast notification
        toast({
            variant: 'destructive',
            title: 'Error',
            description: message,
            duration: 5000, // Keep errors visible longer
        });
    }, [getErrorMessage, toast]);

    return {
        handleError,
        getErrorMessage,
    };
}
