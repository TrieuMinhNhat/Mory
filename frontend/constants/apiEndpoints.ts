export const API_BASE_URL = "/api/backend";

export const API_ENDPOINTS = {
    AUTH: {
        EMAIL_PASSWORD_SIGN_IN: "/api/auth/email-password/sign-in",
        SEND_SIGN_IN_OTP: "/api/auth/email-otp/send-otp",
        EMAIL_OTP_SIGN_IN: "/api/auth/email-otp/sign-in",
        SIGN_UP: "/api/auth/email-password/sign-up",
        SEND_VERIFICATION_OTP: "/api/auth/email-password/send-verification-message",
        VERIFY_REGISTRATION_OTP: "/api/auth/email-password/verify-email",
        SIGN_OUT: "/api/auth/sign-out",
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: "/api/auth/reset-password",
        SET_PASSWORD: "/api/auth/set-password",
        REFRESH_TOKEN: "/api/auth/refresh",
        CHECK_AUTH: "/api/auth/me",
        CHECK_EMAIL: "/api/auth/check-email"
    },
    ADMIN: {
        FETCH_USERS: "/api/admin/users",
        FETCH_USERS_STATS: "/api/admin/users/stats",
        BLOCK_USER: (id: string) => `/api/admin/users/${id}/block`,
        UNBLOCK_USER: (id: string) => `/api/admin/users/${id}/unblock`,
        FETCH_USERS_STATS_DAILY: `/api/admin/users/stats/daily`,
        FETCH_QUESTIONS: "/api/admin/olyne-questions",
        CREATE_QUESTION: "/api/admin/olyne-questions",
        UPDATE_QUESTION: (id: number) => `/api/admin/olyne-questions/${id}`,
        DELETE_QUESTION: (id: number) => `/api/admin/olyne-questions/${id}`,
        FETCH_TOPICS: "/api/admin/olyne-questions/topics",
        CREATE_TOPIC: "/api/admin/olyne-questions/topics",
        UPDATE_TOPIC: (id: number) => `/api/admin/olyne-questions/topics/${id}`,
    },
    USER: {
        PROFILE: {
            UPDATE: "/api/users/me/profile",
            COMPLETE_PROFILE: "/api/users/me/onboarding",
            GET_USER_PROFILE: (id: string) => `/api/users/${id}/profile`,
        },
        CONNECTIONS: {
            FETCH_RECEIVED_REQUESTS: "/api/connections/user/requests/received",
            FETCH_SENT_REQUESTS: "/api/connections/user/requests/sent",
            FETCH_SUGGESTED_CONNECTIONS: "/api/connections/user/suggestions",
            FETCH_USER_CONNECTIONS: (id:string) => `/api/connections/user/${id}`,
            FETCH_CONNECTIONS: "/api/connections/list",
            FETCH_USER_INVITE_LINK: "/api/connections/invite-link",
            FETCH_USER_PROFILE_BY_INVITE_TOKEN: "/api/connections/profile-by-invite",
            REQUEST: {
                SEND_CONNECT_REQUEST: "/api/connections/requests/send-connect",
                ACCEPT_CONNECT_REQUEST: (requestId: string) => `/api/connections/requests/connect/${requestId}/accept`,
                SEND_CHANGE_TYPE_REQUEST: "/api/connections/change-type",
                ACCEPT_CHANGE_TYPE_REQUEST: (requestId: string) => `/api/connections/requests/change-type/${requestId}/accept`,
                REJECT_REQUEST: (requestId: string) => `/api/connections/requests/${requestId}/reject`,
                CANCEL_REQUEST: (requestId: string) => `/api/connections/requests/${requestId}/cancel`
            },
            DOWNGRADE_CONNECTION: "/api/connections/change-type",
            BLOCK_USER: (targetUserId: string) => `/api/connections/block/${targetUserId}`,
            UNBLOCK_USER: (targetUserId: string) => `/api/connections/unblock/${targetUserId}`,
            REMOVE_CONNECTION: (targetUserId: string) => `/api/connections/remove-connection/${targetUserId}`,
        },
        MOMENTS: {
            CREATE_STANDALONE_MOMENT: "/api/moments",
            CREATE_IN_STORY_MOMENT: (storyId: string) => `/api/stories/${storyId}/moments`,
            FETCH_HOME_FEEDS: "/api/moments/home-feed",
            FETCH_MOMENTS_BY_STORY_ID: (storyId: string) => `/api/stories/${storyId}/moments`,
            FETCH_MOMENTS_BY_USER_ID: (userId: string) => `/api/moments/user/${userId}`,
            TOGGLE_REACTION: (momentId: string) => `/api/moments/${momentId}/reaction`,
            FETCH_REACTIONS: (momentId: string) => `/api/moments/${momentId}/reaction`,
            UPDATE: {
                MILESTONE: (momentId: string) => `/api/moments/${momentId}/milestone`,
                VISIBILITY: (momentId: string) => `/api/moments/${momentId}/visibility`,
                TAG: {
                    REMOVE: (momentId: string) => `/api/moments/${momentId}/remove-tags`,
                    ADD: (momentId: string) => `/api/moments/${momentId}/add-tags`,
                }
            },
            DELETE: (momentId: string) => `/api/moments/${momentId}`,
        },
        STORIES: {
            CREATE_STORY: "/api/stories",
            FETCH_STORY: (storyId: string) => `/api/stories/${storyId}`,
            FETCH_STORIES_BY_USER_ID: (userId: string) => `/api/stories/user/${userId}`,
            FETCH_AVAILABLE_STORIES: "/api/stories/available-for-add-moment",
            MEMBERS: {
                ADD: (storyId: string) => `/api/stories/${storyId}/add-members`,
                KICK: (storyId: string) => `/api/stories/${storyId}/kick-members`,
                LEAVE: (storyId: string) => `/api/stories/${storyId}/leave`,
            },
            DISSOLVE: (storyId: string) => `/api/stories/${storyId}/dissolve`,
            UPDATE: (storyId: string) => `/api/stories/${storyId}`,
            DELETE: (storyId: string) => `/api/stories/${storyId}`,
        },
        UPLOAD: "/api/media/signature"
    }
}