import React from "react";
interface  Props {
    className?: string;
}
const Stop: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className={className} fill="none" viewBox="0 0 28 28">
        <path fill="currentColor" d="M4 20.667V7.333c0-.916.327-1.7.98-2.353A3.218 3.218 0 0 1 7.333 4h13.334c.916 0 1.701.327 2.355.98.653.653.98 1.438.978 2.353v13.334c0 .916-.326 1.701-.978 2.355a3.202 3.202 0 0 1-2.355.978H7.333a3.208 3.208 0 0 1-2.353-.978A3.216 3.216 0 0 1 4 20.667Z"/>
    </svg>

)

export default Stop;