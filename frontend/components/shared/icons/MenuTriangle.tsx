import React from "react";
interface  Props {
    className?: string;
}
const MenuTriangle: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" className={className} fill="currentColor" viewBox="0 0 32 32">
        <path d="M3.484 5.12A1.56 1.56 0 0 0 1.92 6.674c0 .859.7 1.555 1.564 1.555h25.031a1.56 1.56 0 0 0 1.565-1.555c0-.858-.7-1.554-1.564-1.554H3.483ZM8.178 16c0-.858.7-1.554 1.564-1.554h18.773A1.56 1.56 0 0 1 30.08 16c0 .858-.7 1.554-1.564 1.554H9.741A1.56 1.56 0 0 1 8.178 16Zm9.386 9.326c0-.859.7-1.555 1.565-1.555h9.386a1.56 1.56 0 0 1 1.565 1.555c0 .858-.7 1.554-1.564 1.554h-9.387a1.56 1.56 0 0 1-1.565-1.554Z"/>
    </svg>

)

export default MenuTriangle;