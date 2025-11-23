export const ROUTES = {
    LANDING: "/",
    PREMIUM: "/premium",
    ONBOARDING: "/onboarding",
    AUTH: {
      SIGN_IN: "/signin",
      SIGN_UP: "/signup",
        RESET_PASSWORDS: "/password",
    },
    HOME: "/home",
    HOME_GRID: "/home/grid",
    STORY: {
        ROOT: "/story",
        DETAILS: (id: string) => `/story/${id}`
    },
    PROFILE: {
        ME: {
            ROOT: "/profile",
            STORIES: "/profile/stories",
            CONNECTIONS: "/profile/connections",
        },
        ROOT: (id: string) => `/profile/${id}`,
        STORIES: (id: string) => `/profile/${id}/stories`,
        CONNECTIONS: (id: string) => `/profile/${id}/connections`,
    },

    CONNECTIONS: {
        ROOT: "/connections",
        REQUESTS: "/connections/requests",
        SUGGESTIONS: "/connections/suggestions",
        LISTS: "/connections/lists",
        BLOCKED: "/connections/blocked",
    },

    ADMIN: {
        ROOT: "/admin",
        USERS: "/admin/users",
        QUESTIONS: "/admin/questions",
    },
} as const;