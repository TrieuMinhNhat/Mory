import {z} from 'zod';

export const createStandAloneSchema = z.object({
    mediaFile: z
        .instanceof(File),
    audioFile: z
        .instanceof(File)
        .nullable(),
    caption: z.string()
        .max(200)
        .nullable(),
    milestone: z
        .boolean()
        .nullable(),
    visibility: z.string()
})

export type CreateStandAloneFormValue = z.infer<typeof createStandAloneSchema>;

export const createStoryMomentSchema = z.object({
    mediaFile: z
        .instanceof(File),
    audioFile: z
        .instanceof(File)
        .nullable(),
    caption: z.string()
        .max(200)
        .nullable(),
    milestone: z.boolean()
})

export type CreateStoryMomentFormValue = z.infer<typeof createStoryMomentSchema>;