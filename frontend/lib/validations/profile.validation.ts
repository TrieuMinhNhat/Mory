import {z} from "zod";

export const updateUserInformationSchema = z.object({
    displayName: z
        .string()
        .min(6, { message: "Full name must be at least 6 characters" })
        .max(50, { message: "Full name must be at most 50 characters" }),
})

export type UpdateUserInformationFormValue = z.infer<typeof updateUserInformationSchema>;

export const completeProfileSchema = z.object({
    displayName: z
        .string()
        .min(3, {message: "Display Name must be at least 3 characters"})
        .max(50, {message: "Display Name must be at most 50 characters"}),

    avatarImageFile: z
        .instanceof(File)
        .nullable()
})

export type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;