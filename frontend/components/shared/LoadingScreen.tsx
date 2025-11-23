import MoryLogo from "@/components/logo/MoryLogo";

const LoadingScreen = ({className}: {className?: string}) => {
    return (
        <div className={`w-full ${className ? className : "h-screen"} flex items-center justify-center bg-background`}>
            <div className={"block rounded-xl overflow-hidden md:hidden"}>
                <MoryLogo className={"size-20"}/>
            </div>
            <div className={"hidden rounded-xl overflow-hidden md:block lg:hidden"}>
                <MoryLogo className={"size-24"}/>
            </div>
            <div className={"hidden rounded-xl overflow-hidden lg:block"}>
                <MoryLogo className={"size-32"}/>
            </div>
        </div>
    )
}

export default LoadingScreen;