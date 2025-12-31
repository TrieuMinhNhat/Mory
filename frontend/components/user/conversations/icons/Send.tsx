import React from "react";
interface  Props {
    className?: string;
}
const Send: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" className={className} viewBox="0 0 26 26">
        <path fill="currentColor" d="M23.989 22.173a1.614 1.614 0 0 1-1.785.484l-8.12-2.742a.406.406 0 0 1-.276-.385v-7.342a.813.813 0 0 0-.866-.812.832.832 0 0 0-.759.838v7.313a.407.407 0 0 1-.276.385l-8.12 2.742a1.624 1.624 0 0 1-1.956-2.328l9.747-17.062a1.624 1.624 0 0 1 2.833 0l9.75 17.06a1.614 1.614 0 0 1-.172 1.849Z"/>
    </svg>

)

export default Send;