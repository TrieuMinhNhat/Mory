import React from "react";
interface  Props {
    className?: string;
}
const OGrid: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className={className}  fill="currentColor" viewBox="0 0 30 30">
        <path d="M11.25 16.25a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-5a2.5 2.5 0 0 1-2.5-2.5v-5a2.5 2.5 0 0 1 2.5-2.5h5Zm12.5 0a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-5a2.5 2.5 0 0 1-2.5-2.5v-5a2.5 2.5 0 0 1 2.5-2.5h5Zm-12.5-12.5a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-5a2.5 2.5 0 0 1-2.5-2.5v-5a2.5 2.5 0 0 1 2.5-2.5h5Zm12.5 0a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-5a2.5 2.5 0 0 1-2.5-2.5v-5a2.5 2.5 0 0 1 2.5-2.5h5Z"/>
    </svg>

)

export default OGrid;
