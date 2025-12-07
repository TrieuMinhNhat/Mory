import React from "react";
interface  Props {
    className?: string;
}
const Cancel: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" className={className} viewBox="0 0 30 30">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="m6 24 9-9 9 9m0-18-9.002 9L6 6"/>
    </svg>

)

export default Cancel;