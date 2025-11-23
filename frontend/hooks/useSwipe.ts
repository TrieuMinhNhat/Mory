// hook: useSwipe.ts
import React, { useRef } from "react";

export function useSwipe(
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void,
    threshold = 50
) {
    const startX = useRef(0);
    const startY = useRef(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        startX.current = t.clientX;
        startY.current = t.clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX.current;
        const dy = t.clientY - startY.current;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > threshold) onSwipeRight?.();
            else if (dx < -threshold) onSwipeLeft?.();
        } else {
            if (dy > threshold) onSwipeDown?.();
            else if (dy < -threshold) onSwipeUp?.();
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        startX.current = e.clientX;
        startY.current = e.clientY;
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        const dx = e.clientX - startX.current;
        const dy = e.clientY - startY.current;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > threshold) onSwipeRight?.();
            else if (dx < -threshold) onSwipeLeft?.();
        } else {
            if (dy > threshold) onSwipeDown?.();
            else if (dy < -threshold) onSwipeUp?.();
        }
    };

    return {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
    };
}
