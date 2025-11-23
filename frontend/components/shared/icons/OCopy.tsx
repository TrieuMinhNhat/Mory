import React from "react";
interface  Props {
    className?: string;
}
const OCopy: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className={className}  fill="currentColor" viewBox="0 0 30 30">
        <path d="M11.25 22.5a2.406 2.406 0 0 1-1.765-.734A2.412 2.412 0 0 1 8.75 20V5c0-.688.245-1.276.735-1.765A2.413 2.413 0 0 1 11.25 2.5H22.5c.688 0 1.276.245 1.766.735S25.001 4.313 25 5v15a2.41 2.41 0 0 1-.734 1.766 2.4 2.4 0 0 1-1.766.734H11.25Zm0-2.5H22.5V5H11.25v15Zm-5 7.5a2.406 2.406 0 0 1-1.765-.734A2.412 2.412 0 0 1 3.75 25V8.75c0-.354.12-.65.36-.89s.537-.36.89-.36.65.12.891.36.36.538.359.89V25h12.5c.354 0 .651.12.891.36s.36.537.359.89c0 .353-.12.65-.36.891s-.536.36-.89.359H6.25Z"/>
    </svg>

)

export default OCopy;