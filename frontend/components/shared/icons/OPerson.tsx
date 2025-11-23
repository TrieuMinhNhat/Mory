import React from "react";
interface  Props {
    className?: string;
}
const OPerson: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className}  fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm0 6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5H8Z"/>
    </svg>

)

export default OPerson;
