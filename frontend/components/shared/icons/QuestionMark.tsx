import React from "react";
interface  Props {
    className?: string;
}
const QuestionMark: React.FC<Props> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className={className} fill="none" viewBox="0 0 20 20">
        <path fill="currentColor" d="M11.739 16.213a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
        <path fill="currentColor" fillRule="evenodd" d="M9.71 4.765c-.67 0-1.245.2-1.65.486-.39.276-.583.597-.64.874a1.45 1.45 0 0 1-2.841-.574c.227-1.126.925-2.045 1.809-2.67.92-.65 2.086-1.016 3.322-1.016 2.557 0 5.208 1.71 5.208 4.456 0 1.59-.945 2.876-2.17 3.626a1.45 1.45 0 0 1-1.513-2.474c.57-.349.783-.794.783-1.152 0-.574-.715-1.556-2.308-1.556Z" clipRule="evenodd"/>
        <path fill="currentColor" fillRule="evenodd" d="M9.71 8.63c.8 0 1.45.648 1.45 1.45v1.502a1.45 1.45 0 0 1-2.9 0V10.08c0-.8.649-1.45 1.45-1.45Z" clipRule="evenodd"/>
        <path fill="currentColor" fillRule="evenodd" d="M13.239 7.966a1.451 1.451 0 0 1-.5 1.99l-2.284 1.367a1.45 1.45 0 1 1-1.49-2.488l2.285-1.368a1.45 1.45 0 0 1 1.989.5Z" clipRule="evenodd"/>
    </svg>

)

export default QuestionMark;