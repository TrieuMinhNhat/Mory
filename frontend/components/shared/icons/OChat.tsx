import React from "react";
interface  Props {
    className?: string;
}
const OChat: React.FC<Props> = ({className}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="300.000000pt"
        height="300.000000pt"
        viewBox="0 0 300.000000 300.000000"
        preserveAspectRatio="xMidYMid meet"
        className={className}
        fill="currentColor"
    >
        <g transform="translate(0.000000,300.000000) scale(0.050000,-0.050000)" stroke="none">
            <path d="M2750 5588 c-2534 -388 -3119 -3646 -870 -4845 460 -245 1217 -384
            1625 -297 157 33 91 74 -120 74 -812 2 -1668 494 -2231 1283 -738 1034 -468
            2557 564 3193 1458 896 3256 -67 3316 -1776 42 -1183 -677 -2074 -1844 -2285
            -303 -55 -133 -124 270 -110 2151 75 2953 2949 1191 4268 -490 368 -1320 583
            -1901 495z"/>
            <path d="M4022 3339 c-348 -78 -344 -600 5 -678 325 -74 551 327 326 576 -82
            89 -210 129 -331 102z"/>
            <path d="M2802 3278 c-357 -75 -300 -621 65 -621 214 0 360 182 314 390 -37
            161 -209 267 -379 231z"/>
            <path d="M1590 3212 c-195 -87 -240 -363 -80 -488 130 -103 291 -91 405 30
            203 215 -55 578 -325 458z"/>
        </g>
    </svg>

);

export default OChat;