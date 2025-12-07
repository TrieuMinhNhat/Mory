import React, { useState, useRef, useLayoutEffect } from "react";

export default function AutoResizeTextarea() {
    const [text, setText] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxWidth = 400; // max width

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // reset height để tính scrollHeight chính xác
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";

        // giới hạn max width
        textarea.style.maxWidth = `${maxWidth}px`;
    }, [text]);

    return (
        <textarea
            ref={textareaRef}
            value={text}
            placeholder="Viết gì đó..."
            onChange={(e) => setText(e.target.value)}
            className="border p-2 rounded resize-none overflow-hidden w-full max-w-[400px] transition-all duration-150"
            rows={1}
        />
    );
}