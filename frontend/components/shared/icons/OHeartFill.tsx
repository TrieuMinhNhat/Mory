import React from "react";
interface  Props {
    className?: string;
}
const OHeartFill: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" className={className}  fill="currentColor" viewBox="0 0 40 40">
        <path d="M11.9 3.75c-3.195 0-5.913 1.148-7.818 3.24-1.887 2.07-2.832 4.905-2.832 8.043 0 5.45 2.775 9.792 6.3 13.17 3.51 3.362 7.925 5.92 11.58 7.832a1.875 1.875 0 0 0 1.733.005c3.657-1.892 8.07-4.47 11.582-7.85 3.525-3.387 6.305-7.745 6.305-13.157 0-3.15-.95-5.983-2.84-8.053-1.907-2.087-4.625-3.232-7.81-3.232-2.69 0-4.915.997-6.608 2.877A11.247 11.247 0 0 0 20 8.76a11.247 11.247 0 0 0-1.492-2.135C16.814 4.745 14.59 3.75 11.9 3.75Z"/>
    </svg>

)

export default OHeartFill;