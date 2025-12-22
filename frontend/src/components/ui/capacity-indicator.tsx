/**
 * Capacity Indicator Component
 * Visual progress bar showing center/group capacity utilization
 */

import React from 'react';
import { Users } from 'lucide-react';

interface CapacityIndicatorProps {
    current: number;
    max?: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function CapacityIndicator({
    current,
    max,
    showLabel = true,
    size = 'md'
}: CapacityIndicatorProps) {
    const isUnlimited = !max || max === 0;
    const percentage = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
    const remaining = isUnlimited ? Infinity : Math.max(max - current, 0);

    // Color coding based on capacity
    const getColor = () => {
        if (isUnlimited) return 'bg-blue-500';
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getTextColor = () => {
        if (isUnlimited) return 'text-blue-700';
        if (percentage >= 90) return 'text-red-700';
        if (percentage >= 70) return 'text-yellow-700';
        return 'text-green-700';
    };

    const heightClass = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
    }[size];

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex items-center justify-between mb-1 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>
                            {current} {isUnlimited ? 'registered' : `/ ${max}`}
                        </span>
                    </div>
                    {!isUnlimited && (
                        <span className={`text-xs font-medium ${getTextColor()}`}>
                            {remaining === 0 ? 'Full' : `${remaining} spots left`}
                        </span>
                    )}
                </div>
            )}
            {!isUnlimited && (
                <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`${getColor()} ${heightClass} transition-all duration-300 rounded-full`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}
