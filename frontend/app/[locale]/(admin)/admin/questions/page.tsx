"use client"

import QuestionsTab from "@/components/admin/questions/QuestionsTab";
import TopicsTab from "@/components/admin/topics/TopicsTab";
import {useState} from "react";

const enum QuestionsPageTabs {
    QUESTIONS,
    TOPICS
}

const QuestionsPage = () => {
    const [currentTab, setCurrentTab] = useState(QuestionsPageTabs.QUESTIONS);
    return (
        <>
            {currentTab === QuestionsPageTabs.QUESTIONS
                ? (<QuestionsTab onChangeTab={() => setCurrentTab(QuestionsPageTabs.TOPICS)}/>)
                : (<TopicsTab onChangeTab={() => setCurrentTab(QuestionsPageTabs.QUESTIONS)}/>)}
        </>

    )
}

export default QuestionsPage;