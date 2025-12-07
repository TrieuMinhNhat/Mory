import {createStore} from "zustand/vanilla";
import {ApiResult} from "@/types/auth";
import {useStoreWithEqualityFn} from "zustand/traditional";
import {OlyneQuestion, QuestionPage, QuestionTopic} from "@/types/adminQuestion";
import {
    createQuestion,
    createTopic, deleteQuestion,
    FetchQuestionParams,
    fetchQuestions,
    fetchTopics,
    updateQuestion, updateTopic
} from "@/lib/services/adminQuestion.service";
import {
    CreateQuestionFormValue,
    CreateTopicFormValue,
    UpdateQuestionFormValue, UpdateTopicFormValue
} from "@/lib/validations/adminQuestion.validation";

interface AdminQuestionState {
    questions: OlyneQuestion[],
    questionPageInfo: QuestionPage | null,
    topics: QuestionTopic[],
    isFetchingQuestions: boolean,
    isCreatingQuestion: boolean,
    isDeletingQuestion: boolean,
    isCreatingTopic: boolean
    isFetchingTopics: boolean,
    isUpdatingQuestion: boolean,
    updatingQuestionId: number | null,
    isUpdatingTopic: boolean,
    fetchQuestions: (params: FetchQuestionParams) => Promise<ApiResult>;
    createQuestion: (data: CreateQuestionFormValue) => Promise<ApiResult>,
    updateQuestion: (id: number, data: UpdateQuestionFormValue) => Promise<ApiResult>,
    deleteQuestion: (id: number) => Promise<ApiResult>,
    fetchTopics: () => Promise<ApiResult>;
    createTopic: (data: CreateTopicFormValue) => Promise<ApiResult>;
    updateTopic: (id: number, data: UpdateTopicFormValue) => Promise<ApiResult>;
}

const adminQuestionStore = createStore<AdminQuestionState>()((set) => ({
    questions: [],
    topics: [],
    questionPageInfo: null,
    isFetchingQuestions: false,
    isFetchingTopics: false,
    isCreatingQuestion: false,
    isCreatingTopic: false,
    isUpdatingQuestion: false,
    isDeletingQuestion: false,
    updatingQuestionId: null,
    isUpdatingTopic: false,
    fetchQuestions: async (params): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isFetchingQuestions", async () => {
            const response = await fetchQuestions(params);
            if (response.success) {
                set({
                    questions: response.data.questions as OlyneQuestion[],
                    questionPageInfo: {
                        totalPages: response.data.totalPages,
                        currentPage: response.data.currentPage,
                        hasNext: response.data.hasNext
                    } as QuestionPage
                })
            }
            return {success: response.success, message: response.message}
        }, "Failed to fetch questions");
    },
    createQuestion: async (data: CreateQuestionFormValue): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isCreatingQuestion", async () => {
            const response = await createQuestion(data);
            if (response.success) {
                set((state) => ({
                    questions: [response.data as OlyneQuestion, ...state.questions]
                }));
            }
            return {success: response.success, message: response.message}
        }, "Failed to create question");
    },
    updateQuestion: async (id: number, data: UpdateQuestionFormValue): Promise<ApiResult> => {
        return runWithLoadingAndTemp(set, "isUpdatingQuestion", async () => {
            const response = await updateQuestion(id, data);
            if (response.success) {
                set((state) => ({
                    questions: state.questions.map((q) =>
                        q.id === id ? (response.data as OlyneQuestion) : q
                    )
                }));
            }
            return {success: response.success, message: response.message}
        }, "Failed to update question", {key: "updatingQuestionId", value: id});
    },
    deleteQuestion: async (id: number): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isDeletingQuestion", async () => {
            const response = await deleteQuestion(id);
            if (response.success) {
                set((state) => ({
                    questions: state.questions.filter((q) => q.id !== id)
                }))
            }
            return {success: response.success, message: response.message}
        }, "Failed to delete question")
    },
    fetchTopics: async (): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isFetchingTopics", async () => {
            const response = await fetchTopics();
            if (response.success) {
                set({topics: response.data as QuestionTopic[]});
            }
            return {success: response.success, message: response.message}
        }, "Failed to fetch topics");
    },
    createTopic: async (data: CreateTopicFormValue): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isCreatingTopic", async () => {
            const response =  await createTopic(data);
            if (response.success) {
                set((state) => ({
                    topics: [response.data as QuestionTopic, ...state.topics]
                }));
            }
            return {success: response.success, message: response.message}
        }, "Failed to create topic");
    },
    updateTopic: async (id: number, data: UpdateTopicFormValue): Promise<ApiResult> => {
        return runWithLoadingFlag(set, "isUpdatingTopic", async () => {
            const response = await updateTopic(id, data);
            if (response.success) {
                set((state) => ({
                    topics: state.topics.map((t) =>
                        t.id === id ? (response.data as QuestionTopic) : t
                    )
                }));
            }
            return {success: response.success, message: response.message}
        }, "Failed to update topic");
    }
}));

const runWithLoadingFlag = async (
    set: (state: Partial<AdminQuestionState>) => void,
    loadingKey: keyof AdminQuestionState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
): Promise<ApiResult> => {
    set({ [loadingKey]: true } as Partial<AdminQuestionState>);
    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({ [loadingKey]: false } as Partial<AdminQuestionState>);
    }
};

const runWithLoadingAndTemp = async (
    set: (state: Partial<AdminQuestionState>) => void,
    loadingKey: keyof AdminQuestionState,
    fn: () => Promise<ApiResult>,
    fallbackMessage: string,
    tempValue?: { key: keyof AdminQuestionState; value: unknown }
): Promise<ApiResult> => {
    set({
        [loadingKey]: true,
        ...(tempValue ? { [tempValue.key]: tempValue.value } : {})
    } as Partial<AdminQuestionState>);

    try {
        return await fn();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return { success: false, message: fallbackMessage };
    } finally {
        set({
            [loadingKey]: false,
            ...(tempValue ? { [tempValue.key]: null } : {})
        } as Partial<AdminQuestionState>);
    }
};

export const useAdminQuestionStore = <T>(
    selector: (state: AdminQuestionState) => T,
    equals?: (a:T, b:T) => boolean
) => useStoreWithEqualityFn(adminQuestionStore, selector, equals);