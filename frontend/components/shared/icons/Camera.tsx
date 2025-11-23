import React from "react";
interface  Props {
    className?: string;
}
const Camera: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" className={className} fill="currentColor" viewBox="0 0 35 35">
        <path d="M27.493 4.562a4.223 4.223 0 0 1 4.223 4.223v16.893a4.223 4.223 0 0 1-4.223 4.223H7.785a4.223 4.223 0 0 1-4.223-4.223V8.785a4.223 4.223 0 0 1 4.223-4.223h19.708Zm-9.854 5.63a7.038 7.038 0 1 0 0 14.077 7.038 7.038 0 0 0 0-14.076Zm0 2.816a4.223 4.223 0 1 1 0 8.447 4.223 4.223 0 0 1 0-8.447Zm9.854-4.223h-1.408a1.408 1.408 0 0 0-.165 2.806l.165.01h1.408a1.408 1.408 0 0 0 .164-2.806l-.164-.01Z"/>
    </svg>

)

export default Camera;