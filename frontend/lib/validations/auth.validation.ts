import {z} from 'zod';

export const emailPasswordSignInSchema = z.object({
    email: z
        .email({ message: "Invalid email address" }),
    password: z
        .string().nonempty({message: "Password is required"})
})

export type EmailPasswordSignInFormValues = z.infer<typeof emailPasswordSignInSchema>;

export const sendOtpSignInSchema = z.object({
    email: z
        .email({ message: "Invalid email address" }),
})

export type SendOtpSignInFormValues = z.infer<typeof sendOtpSignInSchema>;

export const emailOtpSignInSchema = z.object({
    email: z
        .email({ message: "Invalid email address" }),
    inputOtp: z
        .string().nonempty({message: "Otp is required"})
})

export type EmailOtpSignInFormValues = z.infer<typeof emailOtpSignInSchema>;

export const forgotPasswordSchema = z.object({
    email: z
        .email({ message: "Invalid email address" }),
})



export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        email: z
            .email({ message: "Invalid email address" }),
        newPassword: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" })
            .max(50, { message: "Password must be at most 50 characters" })
            .refine(val => /[a-z]/.test(val), {
                message: "Password must include at least one lowercase letter",
            })
            .refine(val => /[A-Z]/.test(val), {
                message: "Password must include at least one uppercase letter",
            })
            .refine(val => /\d/.test(val), {
                message: "Password must include at least one number",
            })
            .refine(val => /[@$!%*?&]/.test(val), {
                message: "Password must include at least one special character (@$!%*?&)",
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const setPasswordSchema = z
    .object({
        newPassword: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" })
            .max(50, { message: "Password must be at most 50 characters" })
            .refine(val => /[a-z]/.test(val), {
                message: "Password must include at least one lowercase letter",
            })
            .refine(val => /[A-Z]/.test(val), {
                message: "Password must include at least one uppercase letter",
            })
            .refine(val => /\d/.test(val), {
                message: "Password must include at least one number",
            })
            .refine(val => /[@$!%*?&]/.test(val), {
                message: "Password must include at least one special character (@$!%*?&)",
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;

export const getStartedSchema = z.object({
    email: z
        .email({ message: "Invalid email address" }),
})

export type GetStartedFormValues = z.infer<typeof getStartedSchema>;

export const signUpSchema = z
    .object({
        email: z
            .email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters" })
            .max(50, { message: "Password must be at most 50 characters" })
            .refine(val => /[a-z]/.test(val), {
                message: "Password must include at least one lowercase letter",
            })
            .refine(val => /[A-Z]/.test(val), {
                message: "Password must include at least one uppercase letter",
            })
            .refine(val => /\d/.test(val), {
                message: "Password must include at least one number",
            })
            .refine(val => /[@$!%*?&]/.test(val), {
                message: "Password must include at least one special character (@$!%*?&)",
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const verifyPasswordSchema = z.object({
    inputOtp: z
        .string()
        .length(6, "OTP must be 6 digits")
        .regex(/^\d+$/, "Only digits allowed"),
});

export type VerifyPasswordFormValues = z.infer<typeof verifyPasswordSchema>;

