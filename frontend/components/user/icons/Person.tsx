import React from "react";
interface  Props {
    className?: string;
}
const Person: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M14.083 10.3c.464 0 .91.19 1.238.527.328.338.512.796.512 1.273v.6c0 2.365-2.17 4.8-5.833 4.8-3.663 0-5.833-2.435-5.833-4.8v-.6c0-.477.184-.935.512-1.273a1.726 1.726 0 0 1 1.237-.527h8.167ZM10 2.5c.85 0 1.667.348 2.268.967.602.618.94 1.458.94 2.333 0 .875-.338 1.715-.94 2.333A3.164 3.164 0 0 1 10 9.1a3.165 3.165 0 0 1-2.269-.967 3.348 3.348 0 0 1-.94-2.333c0-.875.339-1.715.94-2.333A3.164 3.164 0 0 1 10 2.5Z"/>
    </svg>
)

export default Person;