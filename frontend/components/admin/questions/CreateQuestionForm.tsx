"use client"

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {
    createQuestionSchema,
    CreateQuestionFormValue
} from "@/lib/validations/adminQuestion.validation";
import {useTranslation} from "next-i18next";
import {toast} from "sonner";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import {QuestionType} from "@/types/adminQuestion";
import i18n from "i18next";
import {Textarea} from "@/components/ui/textarea";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

const TYPE_LABELS: Record<QuestionType, string> = {
    [QuestionType.OPEN_ENDED]: "OPEN_ENDED",
    [QuestionType.YES_NO]: "YES_NO",
    [QuestionType.MULTIPLE_CHOICE]: "MULTIPLE_CHOICE",
    [QuestionType.RATING]: "RATING",
    [QuestionType.SCALE]: "SCALE",
    [QuestionType.IMAGE]: "IMAGE",
    [QuestionType.VIDEO]: "VIDEO",
    [QuestionType.AUDIO]: "AUDIO"
};

interface Props {
    setIsOpen: (value: boolean) => void;
}

const CreateQuestionForm = ({setIsOpen}: Props) => {
    const {t: ad} = useTranslation("admin");
    const {t: ts} = useTranslation("toast");
    const {topics, isCreatingQuestion, createQuestion} = useAdminQuestionStore(
        (state) => ({
            topics: state.topics,
            isCreatingQuestion: state.isCreatingQuestion,
            createQuestion: state.createQuestion
        }),
        shallow
    );

    const form = useForm<CreateQuestionFormValue>({
        resolver: zodResolver(createQuestionSchema),
        defaultValues: {
            contentEN: "",
            contentVI: "",
            topicId: "",
            difficulty: undefined,
            type: "",
        }
    });

    const handleSubmit = async (data: CreateQuestionFormValue) => {
        const result = await createQuestion(data);
        if (result.success) {
            toast.success(ts("admin.create_question.success"));
            setIsOpen(false)
        } else {
            toast.error(ts("admin.create_question.error"))
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="contentEN"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    className={"border-primary !ring-none focus:!ring-primary !outline-none focus:!outline-none"}
                                    placeholder={ad("questions_page.create_question.placeholder.contentEN")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contentVI"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    className={"border-primary !ring-none focus:!ring-primary !outline-none focus:!outline-none"}
                                    placeholder={ad("questions_page.create_question.placeholder.contentVI")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {/* Topic dropdown */}
                <FormField
                    control={form.control}
                    name="topicId"
                    render={({field}) => (
                        <FormItem>
                            <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={"border-primary !ring-none focus:!ring-primary h-10 md:h-12 !outline-none focus:!outline-none"}
                                    >
                                        <SelectValue placeholder={ad("questions_page.create_question.placeholder.topic")}/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent
                                    className="bg-container-200 max-h-64 md:max-h-96 overflow-y-auto"
                                >
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        {topics.map((topic) => (
                                            <SelectItem
                                                key={topic.id}
                                                value={topic.id.toString()}
                                                className="whitespace-normal text-center"
                                            >
                                                {i18n.language === "vi" ? topic.nameVI : topic.nameEN}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                        <FormItem>
                            <Select
                                value={field.value?.toString() || ""}
                                onValueChange={(val) => field.onChange(Number(val))}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={"border-primary !ring-none focus:!ring-primary h-10 md:h-12 !outline-none focus:!outline-none"}
                                    >
                                        <SelectValue placeholder={ad("questions_page.create_question.placeholder.difficulty")}/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-container-200">
                                    <div className="grid grid-cols-5 gap-2 p-2">
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                            <SelectItem
                                                key={num}
                                                value={num.toString()}
                                                className="flex items-center justify-center"
                                            >
                                                {num}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />


                {/* Type dropdown */}
                <FormField
                    control={form.control}
                    name="type"
                    render={({field}) => (
                        <FormItem>
                            <Select
                                value={field.value || ""}
                                onValueChange={field.onChange}
                            >
                                <FormControl>
                                    <SelectTrigger
                                        className={"border-primary !ring-none focus:!ring-primary h-10 md:h-12 !outline-none focus:!outline-none"}
                                    >
                                        <SelectValue placeholder={ad("questions_page.create_question.placeholder.type")}/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-container-200">
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        {Object.entries(TYPE_LABELS).map(([code]) => (
                                            <SelectItem key={code} value={code}>
                                                {ad(`questions_page.type_labels.${code}`)}
                                            </SelectItem>
                                        ))}
                                    </div>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className={"h-10 md:h-12"}
                    disabled={isCreatingQuestion}
                >
                    <ContentWithLoader isLoading={isCreatingQuestion}>
                        {ad("questions_page.create_question.submit_btn")}
                    </ContentWithLoader>
                </Button>
            </form>
        </Form>
    )
};

export default CreateQuestionForm;
