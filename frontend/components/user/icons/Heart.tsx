import React from "react";
interface  Props {
    className?: string;
}
const Heart: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.5 7.765c-.026-1.717-1.022-3.408-2.552-4.105a3.633 3.633 0 0 0-2.622-.151c-.784.243-1.57.741-2.326 1.525-.757-.784-1.542-1.28-2.326-1.525a3.633 3.633 0 0 0-2.622.15c-1.53.698-2.526 2.389-2.552 4.106v.009c0 2.504 1.524 4.723 3.14 6.28a13.62 13.62 0 0 0 2.426 1.873c.375.224.73.403 1.044.529.3.12.614.21.89.21s.589-.09.889-.21c.315-.125.67-.304 1.044-.528a13.622 13.622 0 0 0 2.427-1.873c1.616-1.558 3.14-3.777 3.14-6.28v-.01Z"/>
    </svg>

)

export default Heart;