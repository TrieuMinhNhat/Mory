import React from "react";
interface  Props {
    className?: string;
}
const Users: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" className={className} height="30" fill="none" viewBox="0 0 30 30">
        <path fill="currentColor" fillRule="evenodd" d="M10 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM7.5 16.25a5 5 0 0 0-5 5v1.25A2.5 2.5 0 0 0 5 25h10a2.5 2.5 0 0 0 2.5-2.5v-1.25a5 5 0 0 0-5-5h-5Zm9.063-2.619a7.5 7.5 0 0 0 0-7.264 5 5 0 1 1 0 7.264Zm2.77 11.37A4.978 4.978 0 0 0 20 22.5v-1.25a7.475 7.475 0 0 0-1.91-5h4.41a5 5 0 0 1 5 5v1.25A2.5 2.5 0 0 1 25 25h-5.668Z" clipRule="evenodd"/>
    </svg>

)

export default Users;