"use client"

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {updateTopicSchema, UpdateTopicFormValue} from "@/lib/validations/adminQuestion.validation";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea";
import {useTranslation} from "next-i18next";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";
import {QuestionTopic} from "@/types/adminQuestion";

interface Props {
    topic: QuestionTopic,
    setIsOpen: (value: boolean) => void,
    setTopic: (topic: QuestionTopic | undefined) => void,
}

const EditTopicForm = ({topic, setIsOpen, setTopic}: Props) => {
    const {t: ad} = useTranslation("admin")
    const {t: ts} = useTranslation("toast")
    const {updateTopic, isUpdatingTopic} = useAdminQuestionStore(
        (state) => ({
            updateTopic: state.updateTopic,
            isUpdatingTopic: state.isUpdatingTopic,
        }),
        shallow
    )
    const form = useForm<UpdateTopicFormValue>({
        resolver: zodResolver(updateTopicSchema),
        defaultValues: {
            nameEN: topic.nameEN,
            nameVI: topic.nameVI,
            descriptionEN: topic.descriptionEN,
            descriptionVI: topic.descriptionVI
        }
    });

    const handleSubmit = async (data: UpdateTopicFormValue) => {
        const result = await updateTopic(topic.id, data);
        if (result.success) {
            toast.success(ts("admin.update_topic.success"));
            setIsOpen(false);
            setTopic(undefined)
        } else {
            toast.error(ts("admin.update_topic.error"))
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                <FormField
                    control={form.control}
                    name="nameEN"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    className={"border-primary !ring-none focus:!ring-primary h-10 md:h-12 !outline-none focus:!outline-none"}
                                    placeholder={ad("questions_page.topics_tab.create_topic.placeholder.nameEN")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nameVI"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    className={"border-primary !ring-none focus:!ring-primary h-10 md:h-12 !outline-none focus:!outline-none"}
                                    placeholder={ad("questions_page.topics_tab.create_topic.placeholder.nameVI")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="descriptionEN"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    className={"border-primary !ring-none focus:!ring-primary !outline-none focus:!outline-none"}
                                    placeholder={ad("questions_page.topics_tab.create_topic.placeholder.descriptionEN")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="descriptionVI"
                    render={({field}) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    className={"border-primary !ring-none focus:!ring-primary !outline-none focus:!outline-none"}
                                    placeholder={ad("questions_page.topics_tab.create_topic.placeholder.descriptionVI")}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className={"h-10 md:h-12"}
                    disabled={isUpdatingTopic}
                >
                    <ContentWithLoader isLoading={isUpdatingTopic}>
                        {ad("questions_page.topics_tab.edit_topic.submit_btn")}
                    </ContentWithLoader>
                </Button>
            </form>
        </Form>
    )
}

export default EditTopicForm;
