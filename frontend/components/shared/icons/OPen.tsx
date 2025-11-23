import React from "react";
interface  Props {
    className?: string;
}
const OPen: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className}  fill="currentColor" viewBox="0 0 24 24">
        <path d="M16.183 2.733 14.29 4.626l5.084 5.083 1.893-1.893a2.502 2.502 0 0 0 0-3.538l-1.541-1.545a2.502 2.502 0 0 0-3.539 0h-.004ZM13.407 5.51 4.29 14.628a3.467 3.467 0 0 0-.868 1.462L2.04 20.794a.939.939 0 0 0 1.161 1.17l4.705-1.385a3.467 3.467 0 0 0 1.462-.868l9.123-9.118-5.083-5.084Z"/>
    </svg>

)

export default OPen;