import {z} from 'zod';

export const createQuestionSchema = z.object({
    contentEN: z.string().nonempty().min(6),
    contentVI: z.string().nonempty().min(6),
    topicId: z.string().nonempty(),
    difficulty: z.number().min(1).max(10),
    type: z.string().nonempty(),
})

export type CreateQuestionFormValue = z.infer<typeof createQuestionSchema>;

export const updateQuestionSchema = z.object({
    contentEN: z.string().nonempty().min(6),
    contentVI: z.string().nonempty().min(6),
    difficulty: z.number().min(1).max(10),
    type: z.string().nonempty(),
})

export type UpdateQuestionFormValue = z.infer<typeof updateQuestionSchema>;

export const createTopicSchema = z.object({
    nameEN: z.string().nonempty().min(3),
    nameVI: z.string().nonempty().min(3),
    descriptionEN: z.string().nonempty().min(10),
    descriptionVI: z.string().nonempty().min(10),
})

export type CreateTopicFormValue = z.infer<typeof createTopicSchema>;

export const updateTopicSchema = z.object({
    nameEN: z.string().nonempty().min(3),
    nameVI: z.string().nonempty().min(3),
    descriptionEN: z.string().nonempty().min(10),
    descriptionVI: z.string().nonempty().min(10),
})

export  type UpdateTopicFormValue = z.infer<typeof updateTopicSchema>;