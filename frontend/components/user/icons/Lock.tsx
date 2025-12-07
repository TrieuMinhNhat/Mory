import React from "react";
interface  Props {
    className?: string;
}
const Lock: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M15.833 10c0-.827-.654-1.5-1.458-1.5h-.73V6.25c0-2.068-1.635-3.75-3.645-3.75S6.354 4.182 6.354 6.25V8.5h-.73c-.803 0-1.457.673-1.457 1.5v6c0 .827.654 1.5 1.458 1.5h8.75c.804 0 1.458-.673 1.458-1.5v-6Zm-8.02-3.75C7.812 5.01 8.792 4 10 4c1.206 0 2.187 1.01 2.187 2.25V8.5H7.812V6.25Z"/>
    </svg>

)

export default Lock;