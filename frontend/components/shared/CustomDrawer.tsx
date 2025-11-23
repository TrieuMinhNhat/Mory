import React, { ReactNode, useState, useRef } from "react";

interface CustomDrawerProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

const THRESHOLD = 60;

const CustomDrawer = ({ open, onClose, children }: CustomDrawerProps) => {
    const [dragY, setDragY] = useState(0);
    const startYRef = useRef<number | null>(null);
    const draggingRef = useRef(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        startYRef.current = e.touches[0].clientY;
        draggingRef.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!draggingRef.current || startYRef.current === null) return;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - startYRef.current;
        if (deltaY > 0) {
            setDragY(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (!draggingRef.current) return;
        if (dragY > THRESHOLD) {
            onClose();
        }
        setDragY(0);
        startYRef.current = null;
        draggingRef.current = false;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        startYRef.current = e.clientY;
        draggingRef.current = true;

        e.preventDefault();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingRef.current || startYRef.current === null) return;
        const currentY = e.clientY;
        const deltaY = currentY - startYRef.current;
        if (deltaY > 0) {
            setDragY(deltaY);
        }
    };

    const handleMouseUp = () => {
        if (!draggingRef.current) return;
        if (dragY > THRESHOLD) {
            onClose();
        }
        setDragY(0);
        startYRef.current = null;
        draggingRef.current = false;
    };

    const handleMouseLeave = () => {
        if (!draggingRef.current) return;
        if (dragY > THRESHOLD) {
            onClose();
        }
        setDragY(0);
        startYRef.current = null;
        draggingRef.current = false;
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 transition-opacity ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
            onClick={onClose}
        >
            <div
                className={`bg-background rounded-t-2xl shadow-lg fixed bottom-0 left-0 right-0 max-h-[80vh] overflow-auto
                  transform transition-transform duration-300
                  ${open ? "translate-y-0" : "translate-y-full"}
        `}
                style={{
                    transform: open
                        ? `translateY(${dragY}px)`
                        : "translateY(100%)",
                    transition: dragY === 0 ? "transform 0.3s ease" : "none",
                    touchAction: "none",
                    userSelect: draggingRef.current ? "none" : "auto",
                    cursor: draggingRef.current ? "grabbing" : "grab",
                }}
                onClick={(e) => e.stopPropagation()}

                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}

                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div className="bg-background-m rounded-full mx-auto mt-4 h-2 w-20 md:w-[100px] mb-2" />
                {children}
            </div>
        </div>
    );
}

export default CustomDrawer;