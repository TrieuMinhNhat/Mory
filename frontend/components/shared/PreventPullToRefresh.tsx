"use client";

import React, { ReactNode, useEffect } from "react";

interface PreventPullToRefreshProps {
    children: ReactNode;
    disabled?: boolean;
}

const PreventPullToRefresh: React.FC<PreventPullToRefreshProps> = ({ children, disabled = false }) => {
    useEffect(() => {
        if (disabled) return;
        let startY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                startY = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && e.touches.length === 1) {
                const touch = e.touches[0];
                if (touch.clientY > startY) {
                    e.preventDefault();
                }
            }
        };

        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, [disabled]);

    return <>{children}</>;
};

export default PreventPullToRefresh;
