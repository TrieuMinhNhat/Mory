import React from "react";
interface  Props {
    className?: string;
}
const Milestone: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className={className} fill="none" viewBox="0 0 30 30">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.25 17.5h17.5l-5.625-5.625L23.75 6.25H6.25v20"/>
    </svg>

)

export default Milestone;