import React from "react";
interface  Props {
    className?: string;
}
const OMenuDotHorizontal: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" className={className}  fill="currentColor" viewBox="0 0 26 26">
        <path d="M7.583 13a2.167 2.167 0 1 1-4.333 0 2.167 2.167 0 0 1 4.333 0Zm7.584 0a2.167 2.167 0 1 1-4.334 0 2.167 2.167 0 0 1 4.334 0Zm7.583 0a2.167 2.167 0 1 1-4.333 0 2.167 2.167 0 0 1 4.333 0Z"/>
    </svg>

)

export default OMenuDotHorizontal;