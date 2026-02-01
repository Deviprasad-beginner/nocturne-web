import { useState, useCallback, useMemo } from 'react';

/**
 * Configuration for character limit validation
 */
export interface CharacterLimitConfig {
    maxLength: number;
    minLength?: number;
    warningThreshold?: number; // Show warning at X% of max (e.g., 0.9 for 90%)
}

/**
 * Return type for useCharacterLimit hook
 */
export interface UseCharacterLimitReturn {
    value: string;
    length: number;
    remaining: number;
    isOverLimit: boolean;
    isUnderMin: boolean;
    isNearLimit: boolean;
    percentage: number;
    setValue: (value: string) => void;
    reset: () => void;
}

/**
 * Custom hook for managing character limits with validation
 * 
 * @example
 * ```tsx
 * const charLimit = useCharacterLimit({
 *   maxLength: 500,
 *   minLength: 10,
 *   warningThreshold: 0.9
 * });
 * 
 * <textarea
 *   value={charLimit.value}
 *   onChange={(e) => charLimit.setValue(e.target.value)}
 * />
 * <p>{charLimit.remaining} characters remaining</p>
 * ```
 */
export function useCharacterLimit(
    config: CharacterLimitConfig,
    initialValue: string = ''
): UseCharacterLimitReturn {
    const { maxLength, minLength = 0, warningThreshold = 0.9 } = config;
    const [value, setValue] = useState(initialValue);

    const length = value.length;
    const remaining = maxLength - length;
    const percentage = length / maxLength;

    const isOverLimit = length > maxLength;
    const isUnderMin = length < minLength;
    const isNearLimit = percentage >= warningThreshold;

    const reset = useCallback(() => {
        setValue('');
    }, []);

    const handleSetValue = useCallback((newValue: string) => {
        // Optionally enforce max length here
        // For now, we allow over-limit but flag it
        setValue(newValue);
    }, []);

    return useMemo(
        () => ({
            value,
            length,
            remaining,
            isOverLimit,
            isUnderMin,
            isNearLimit,
            percentage,
            setValue: handleSetValue,
            reset,
        }),
        [value, length, remaining, isOverLimit, isUnderMin, isNearLimit, percentage, handleSetValue, reset]
    );
}
