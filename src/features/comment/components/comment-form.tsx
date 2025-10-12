"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import SubmitButton from "@/components/form/submit-button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import commentCreate from "../actions/comment-create";
import { formSchema, MAX_COMMENT_LENGTH } from "../schema";

export default function CommentForm({ ticketId }: { ticketId: string }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const { success, error } = await commentCreate({
      content: data.content,
      ticketId: ticketId,
    });

    if (!success) {
      toast.error(error || "An unknown error occurred");
    } else {
      toast.success("Comment created");
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-y-5"
    >
      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Write a comment"
              autoComplete="off"
              disabled={isSubmitting}
            />

            <FieldGroup className="flex flex-row items-center justify-between">
              <FieldDescription>
                {form.getValues("content").length} / {MAX_COMMENT_LENGTH}
              </FieldDescription>

              {<FieldError errors={[fieldState.error]} className="h-4" />}
            </FieldGroup>
          </Field>
        )}
      />
      <SubmitButton pending={isSubmitting}>Submit</SubmitButton>
    </form>
  );
}
