import {PuffLoader} from "react-spinners";

const SignInLoading = () => {
    return (
        <div className={"signin-form-container h-[480px]"}>
            <div className={"flex flex-col flex-1 w-full justify-center items-center"}>
                <PuffLoader size={100} color={"var(--color-loader-static)"}  />
            </div>
        </div>
    )
}

export default SignInLoading;