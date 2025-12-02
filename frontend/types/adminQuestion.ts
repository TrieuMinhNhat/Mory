export interface OlyneQuestion {
    id: number,
    contentEN: string,
    contentVI: string,
    topic: QuestionTopic,
    difficulty: number,
    type: QuestionType,
    active: boolean,
}

export interface QuestionPage {
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
}
export enum QuestionType {
    OPEN_ENDED = "OPEN_ENDED",
    YES_NO = "YES_NO",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    RATING = "RATING",
    SCALE = "SCALE",
    IMAGE = "IMAGE",
    VIDEO ="VIDEO",
    AUDIO = "AUDIO"
}

export interface QuestionTopic {
    id: number,
    nameEN: string,
    nameVI: string,
    descriptionEN: string,
    descriptionVI: string,
}

export interface QuestionColumnVisibility {
    contentEN: boolean,
    contentVI: boolean,
    topic: boolean,
    difficulty: boolean,
    type: boolean,
    active: boolean,
    actions: boolean,
}

export interface QuestionColumnWidth {
    contentEN: string,
    contentVI: string,
    topic: string,
    difficulty: string,
    type: string,
    active: string,
    actions: string
}

export interface QuestionColumnLabel {
    contentEN: string,
    contentVI: string,
    topic: string,
    difficulty: string,
    type: string,
    active: string,
    actions: string,
}

export const defaultQuestionColumnVisibility: QuestionColumnVisibility = {
    contentEN: true,
    contentVI: true,
    topic: true,
    difficulty: true,
    type: true,
    active: true,
    actions: true
}

export const defaultQuestionColumnWidth: QuestionColumnWidth = {
    contentEN: "1fr",
    contentVI: "1fr",
    topic: "120px",
    difficulty: "80px",
    type: "120px",
    active: "100px",
    actions: "80px"
}

export const questionColumnLabel: QuestionColumnLabel = {
    contentEN: "questions_page.columns.label.contentEN",
    contentVI: "questions_page.columns.label.contentVI",
    topic: "questions_page.columns.label.topic",
    difficulty: "questions_page.columns.label.difficulty",
    type: "questions_page.columns.label.type",
    active: "questions_page.columns.label.active",
    actions: "questions_page.columns.label.actions",
}

export interface TopicColumnVisibility {
    nameEN: boolean,
    nameVI: boolean,
    descriptionEN: boolean,
    descriptionVI: boolean,
    actions: boolean
}

export interface TopicColumnWidth {
    nameEN: string,
    nameVI: string,
    descriptionEN: string,
    descriptionVI: string,
    actions: string
}

export interface TopicColumnLabel {
    nameEN: string,
    nameVI: string,
    descriptionEN: string,
    descriptionVI: string,
    actions: string
}

export const defaultTopicColumnVisibility: TopicColumnVisibility = {
    nameEN: true,
    nameVI: true,
    descriptionEN: true,
    descriptionVI: true,
    actions: true
}

export const defaultTopicColumnWidth: TopicColumnWidth = {
    nameEN: "150px",
    nameVI: "150px",
    descriptionEN: "1fr",
    descriptionVI: "1fr",
    actions: "100px"
}

export const topicColumnLabel: TopicColumnLabel = {
    nameEN: "questions_page.topics_tab.columns.label.nameEN",
    nameVI: "questions_page.topics_tab.columns.label.nameVI",
    descriptionEN: "questions_page.topics_tab.columns.label.descriptionEN",
    descriptionVI: "questions_page.topics_tab.columns.label.descriptionVI",
    actions: "questions_page.topics_tab.columns.label.actions",
}