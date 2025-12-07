import React from "react";
interface  Props {
    className?: string;
}
const Microphone: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className={className} fill="currentColor" viewBox="0 0 28 28">
        <path d="M14 18.667a4.672 4.672 0 0 0 4.667-4.666V7A4.671 4.671 0 0 0 14 2.334a4.671 4.671 0 0 0-4.666 4.667v7A4.672 4.672 0 0 0 14 18.667Zm8.167-4.666v-2.334a1.167 1.167 0 1 0-2.334 0v2.334A5.84 5.84 0 0 1 14 19.834a5.84 5.84 0 0 1-5.833-5.833v-2.334a1.167 1.167 0 0 0-2.333 0v2.334c0 4.106 3.048 7.504 7 8.073v1.26h-3.5a1.167 1.167 0 1 0 0 2.333h9.333a1.167 1.167 0 1 0 0-2.333h-3.5v-1.26c3.951-.57 7-3.967 7-8.073Z"/>
    </svg>

)

export default Microphone;