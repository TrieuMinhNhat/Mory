import React from "react";
interface  Props {
    className?: string;
}
const Crown: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className={className} fill="none" viewBox="0 0 16 16">
        <path fill="currentColor" d="m10.399 5.718-1.64-2.066a1 1 0 1 0-1.517 0l-1.64 2.066a.5.5 0 0 1-.606.142L2.485 4.676a1 1 0 1 0-.895.82l1.3 6.5A1.25 1.25 0 0 0 4.114 13h7.77a1.25 1.25 0 0 0 1.226-1.005l1.3-6.5a1 1 0 1 0-.896-.82l-2.51 1.185a.5.5 0 0 1-.605-.142ZM8 10a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
    </svg>

)

export default Crown;