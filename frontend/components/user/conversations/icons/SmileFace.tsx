import React from "react";
interface  Props {
    className?: string;
}
const SmileFace: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="none" className={className} viewBox="0 0 34 34">
        <path fill="currentColor" d="M24.083 4.732A14.166 14.166 0 1 1 2.84 17.46L2.833 17l.007-.459A14.167 14.167 0 0 1 24.083 4.732Zm-2.55 15.507a1.417 1.417 0 0 0-2.003.02 3.541 3.541 0 0 1-5.06 0 1.417 1.417 0 0 0-2.024 1.983 6.377 6.377 0 0 0 9.107 0 1.416 1.416 0 0 0-.02-2.003Zm-8.77-7.489-.18.01a1.417 1.417 0 0 0 .167 2.824l.18-.01a1.416 1.416 0 0 0-.166-2.823Zm8.5 0-.18.01a1.417 1.417 0 0 0 .167 2.824l.18-.01a1.416 1.416 0 0 0-.166-2.823Z"/>
    </svg>

)

export default SmileFace;