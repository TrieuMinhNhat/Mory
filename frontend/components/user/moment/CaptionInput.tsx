"use client";

import React, { useLayoutEffect, useRef } from "react";

interface CaptionInputProps {
    caption: string;
    setCaption: (value: string) => void;
    placeholder?: string;
}

const CaptionInput: React.FC<CaptionInputProps> = ({
                                                       caption,
                                                       setCaption,
                                                       placeholder = "Write something...",
                                                   }) => {
    const editableRef = useRef<HTMLDivElement>(null);
    const spanRef = useRef<HTMLSpanElement>(null);
    const outerDivRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!editableRef.current || !spanRef.current || !outerDivRef.current) return;

        const editable = editableRef.current;
        const span = spanRef.current;
        const outerWidth = outerDivRef.current.getBoundingClientRect().width;

        const style = getComputedStyle(editable);
        span.style.font = style.font;
        span.style.lineHeight = style.lineHeight;
        span.style.letterSpacing = style.letterSpacing;

        const padding =
            parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

        const rect = span.getBoundingClientRect();
        const newWidth = Math.min(
            Math.max(rect.width + padding, 100),
            outerWidth - 44
        );
        editable.style.width = `${newWidth}px`;

        editable.style.height = "auto";
        editable.style.height = `${editable.scrollHeight}px`;
    }, [caption]);

    return (
        <div className="relative" ref={outerDivRef}>
            <div
                ref={editableRef}
                contentEditable
                suppressContentEditableWarning
                className="inline-block bg-bg-dark-100 bg-opacity-50 rounded-3xl pl-3 pr-2 py-2 font-medium text-base leading-5 text-fg-light-100 min-w-[200px] break-words whitespace-pre-wrap overflow-hidden"
                onInput={(e) => setCaption(e.currentTarget.textContent || "")}
                style={{ outline: "none" }}
            />
            <span
                ref={spanRef}
                className="absolute invisible whitespace-pre text-base font-sans font-medium"
            >
        {caption}
      </span>
            {caption === "" && (
                <span className="absolute left-3 top-2 text-base text-fg-light-200/90 font-medium pointer-events-none">
          {placeholder}
        </span>
            )}
        </div>
    );
};

export default CaptionInput;
