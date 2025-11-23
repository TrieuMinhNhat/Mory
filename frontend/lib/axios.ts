import axios from "axios";
import {API_BASE_URL, API_ENDPOINTS} from "@/constants/apiEndpoints";
import {authStore} from "@/store/useAuthStore";

/**
 * Axios instance with response interceptor to auto-refresh access token
 * using HTTP-only cookie when receiving 401 Unauthorized.
 *
 * - Sends credentials with every request (cookies).
 * - Queues failed requests during refresh to prevent duplicate refresh calls.
 * - Calls /auth/refresh on 401 and retries the original request.
 */

// Create Axios instance with baseURL and cookies enabled
const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    validateStatus: (status) => status !== 401,
})

const NON_RETRY_ENDPOINTS = ["/sign-in", "/sign-out", "/sign-up"];

// Queue to hold failed requests during token refresh
let isRefreshing = false;
let didLogout = false;

let failedQueue: {
    resolve: (value?: unknown) => void,
    reject: (reason?: unknown) => void
}[] = [];

// Retry or reject queued requests after refresh attempt
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(token);
    });
    failedQueue = [];
};

const rawAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log("Interceptor caught error:", error);
        const originalRequest = error.config;

        if (!error.response || originalRequest._retry) {
            return Promise.reject(error);
        }

        const status = error.response.status;
        const requestUrl = originalRequest.url;

        if (status === 401 && NON_RETRY_ENDPOINTS.some((ep) => requestUrl.includes(ep))) {
            return Promise.reject(error);
        }

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => instance(originalRequest)).catch(Promise.reject);
            }

            isRefreshing = true;

            try {
                const res = await rawAxios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);

                if (res.status !== 200) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error("Refresh token request failed");
                }
                processQueue(null);
                return instance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                if (!didLogout) {
                    didLogout = true;
                    failedQueue = [];
                    void authStore.getState().signOut();
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default instance;