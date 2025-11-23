import { checkAuth } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PopupLoginFn = () => Window | null;

export const useOAuthPopupManager = () => {
    const [loading, setLoading] = useState(false);
    const popupRef = useRef<Window | null>(null);

    const router = useRouter();

    const login = (signInPopupFn: PopupLoginFn) => {
        const popup = signInPopupFn();
        if (!popup) {
            console.error("Popup blocked");
            setLoading(false);
            return;
        }

        popupRef.current = popup;
        setLoading(true);
    };


    // Theo dõi popup đóng lại
    useEffect(() => {
        const timer = setInterval(() => {
            if (popupRef.current?.closed) {
                setLoading(false);
                popupRef.current = null;
            }
        }, 500);
        return () => clearInterval(timer);
    }, [popupRef]);

    // Lắng nghe token trả về từ popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === "OAUTH_SUCCESS") {
                popupRef.current?.close();
                popupRef.current = null;
                setLoading(false);
                checkAuth()
                    .then(result => {
                        if (result.success) {
                            router.replace("/home");
                            console.log("success");
                        } else {
                            router.replace("/signin");
                            console.log("failed");
                        }}
                    ).catch(error =>  console.error(error));
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [router]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
                localStorage.removeItem("OAUTH_POPUP_OPEN");
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);


    // Cleanup popup khi component unmount
    useEffect(() => {
        return () => {
            if (popupRef.current && !popupRef.current.closed) {
                popupRef.current.close();
                popupRef.current = null;
            }
        };
    }, []);

    return { login, loading };
};
