"use client"

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {createTopicSchema, CreateTopicFormValue} from "@/lib/validations/adminQuestion.validation";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea";
import {useTranslation} from "next-i18next";
import {useAdminQuestionStore} from "@/store/admin/useAdminQuestionStore";
import {shallow} from "zustand/vanilla/shallow";
import ContentWithLoader from "@/components/shared/ContentWithLoader";

interface Props {
    setIsOpen: (value: boolean) => void;
}

const CreateTopicForm = ({setIsOpen}: Props) => {
    const {t: ad} = useTranslation("admin")
    const {t: ts} = useTranslation("toast")
    const {createTopic, isCreatingTopic} = useAdminQuestionStore(
        (state) => ({
            createTopic: state.createTopic,
            isCreatingTopic: state.isCreatingTopic,
        }),
        shallow
    )
    const form = useForm<CreateTopicFormValue>({
        resolver: zodResolver(createTopicSchema),
        defaultValues: {
            nameEN: "",
            nameVI: "",
            descriptionEN: "",
            descriptionVI: ""
        }
    });

    const handleSubmit = async (data: CreateTopicFormValue) => {
        const result = await createTopic(data);
        if (result.success) {
            toast.success(ts("admin.create_topic.success"));
            setIsOpen(false);
        } else {
            toast.error(ts("admin.create_topic.error"))
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
                    disabled={isCreatingTopic}
                >
                    <ContentWithLoader isLoading={isCreatingTopic}>
                        {ad("questions_page.topics_tab.create_topic.submit_btn")}
                    </ContentWithLoader>
                </Button>
            </form>
        </Form>
    )
}

export default CreateTopicForm;
