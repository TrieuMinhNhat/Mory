import axiosInstance from "@/lib/axios";
import {API_ENDPOINTS} from "@/constants/apiEndpoints";
import {QuestionType} from "@/types/adminQuestion";
import {
    CreateQuestionFormValue,
    CreateTopicFormValue,
    UpdateQuestionFormValue, UpdateTopicFormValue
} from "@/lib/validations/adminQuestion.validation";

export interface FetchQuestionParams {
    topicId?: string;
    type?: QuestionType;
    page?: number;
    size?: number;
}

export const fetchQuestions = async (params: FetchQuestionParams = {}) => {
    const response = await axiosInstance.get(
        API_ENDPOINTS.ADMIN.FETCH_QUESTIONS,
        {
            params: params
        }
    )
    return response.data;
}

export const createQuestion = async (data: CreateQuestionFormValue) => {
    const response = await axiosInstance.post(
        API_ENDPOINTS.ADMIN.CREATE_QUESTION,
        data
    );
    return response.data;
}

export const updateQuestion = async (id: number, data: UpdateQuestionFormValue) => {
    const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.UPDATE_QUESTION(id),
        data
    )
    return response.data;
}

export const deleteQuestion = async (id: number) => {
    const response = await axiosInstance.delete(API_ENDPOINTS.ADMIN.DELETE_QUESTION(id));
    return response.data;
}

export const fetchTopics = async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.ADMIN.FETCH_TOPICS)
    return response.data;
}

export const createTopic = async (data: CreateTopicFormValue) => {
    const response = await  axiosInstance.post(
        API_ENDPOINTS.ADMIN.CREATE_TOPIC,
        data
    )
    return response.data;
}

export const updateTopic = async (id: number, data: UpdateTopicFormValue) => {
    const response = await axiosInstance.put(
        API_ENDPOINTS.ADMIN.UPDATE_TOPIC(id),
        data
    )
    return response.data;
}




