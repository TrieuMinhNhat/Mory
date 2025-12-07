import React from "react";
interface  Props {
    className?: string;
}
const MilestoneFilled: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" className={className} fill="currentColor" viewBox="0 0 30 30">
        <path d="M23.75 5c1.065 0 1.621 1.232.979 2.029l-.095.105-4.74 4.741 4.74 4.741c.753.753.275 2.018-.742 2.127l-.142.007H7.5v7.5a1.25 1.25 0 0 1-1.104 1.241l-.146.009a1.25 1.25 0 0 1-1.241-1.104L5 26.25v-20a1.25 1.25 0 0 1 1.104-1.241L6.25 5h17.5Z"/>
    </svg>

)

export default MilestoneFilled;