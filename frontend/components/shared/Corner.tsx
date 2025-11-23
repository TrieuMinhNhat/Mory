const Corner = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={className}
        >
            <path
                d="M0,24 L0,0 L24,0 Q0,0 0,24 Z"
                style={{ fill: "rgb(var(--background-100))", transition: "fill 0.3s ease" }}
            />

            <path
                d="M24,0 Q0,0 0,24"
                fill="none"
                style={{ stroke: "rgb(var(--background-m))", transition: "stroke 0.3s ease" }}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

export default Corner;
