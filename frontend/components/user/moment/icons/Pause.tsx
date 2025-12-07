import React from "react";
interface  Props {
    className?: string;
}
const Pause: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" className={className} viewBox="0 0 30 30">
        <path fill="currentColor" d="M9.667 25c1.466 0 2.666-1.286 2.666-2.857V7.857c0-1.571-1.2-2.857-2.666-2.857C8.2 5 7 6.286 7 7.857v14.286C7 23.714 8.2 25 9.667 25Zm8-17.143v14.286c0 1.571 1.2 2.857 2.666 2.857C21.8 25 23 23.714 23 22.143V7.857C23 6.286 21.8 5 20.333 5c-1.466 0-2.666 1.286-2.666 2.857Z"/>
    </svg>

)

export default Pause;