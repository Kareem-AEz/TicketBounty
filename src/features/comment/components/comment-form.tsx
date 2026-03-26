"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod/v4";
import FilesInput, {
  FilesInputHandle,
} from "@/components/files-input/component/files-input";
import SubmitButton from "@/components/form/submit-button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import commentUpsert from "../actions/comment-create";
import { formSchema, MAX_COMMENT_LENGTH } from "../schema";
import { Comment } from "../type";

export default function CommentForm({
  ticketId,
  comment,
  onSuccess,
}: {
  ticketId: string;
  comment?: Comment;
  onSuccess?: (comment: Comment | undefined) => void;
}) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: comment?.content || "",
    },
  });

  const handleReset = useRef<FilesInputHandle>(null);

  const isSubmitting = form.formState.isSubmitting;

  const reset = () => {
    form.reset();
    handleReset.current?.reset();
  };

  async function onSubmit(
    data: z.infer<typeof formSchema>,
    attachments: File[],
  ) {
    const {
      success,
      error,
      data: commentData,
    } = await commentUpsert({
      content: data.content,
      attachments: attachments,
      ticketId: ticketId,
      commentId: comment?.id,
    });
    if (!success) {
      toast.error(error || "An unknown error occurred");
    } else {
      toast.success(comment ? "Comment updated" : "Comment created");
      reset();
      onSuccess?.(commentData);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit((data) => onSubmit(data, attachments))();
      }}
      className="flex flex-col gap-y-5"
    >
      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-y-4">
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Write a comment"
                autoComplete="off"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    form.handleSubmit((data) => onSubmit(data, attachments))();
                  }
                }}
              />

              <FieldGroup className="flex flex-row items-center justify-between">
                <FieldDescription>
                  {form.getValues("content").length} / {MAX_COMMENT_LENGTH}
                </FieldDescription>

                {<FieldError errors={[fieldState.error]} className="h-4" />}
              </FieldGroup>
            </Field>

            <Field>
              <FilesInput
                value={attachments}
                onChange={setAttachments}
                onError={(errors) => {
                  for (const error of errors) {
                    toast.error(error.message);
                  }
                }}
                disabled={isSubmitting}
                ref={handleReset}
              />
            </Field>
          </div>
        )}
      />
      <SubmitButton
        pending={isSubmitting}
        pendingLabel="Submitting..."
        data-umami-event={comment ? "comment-update" : "comment-create"}
        data-umami-event-length={
          form.getValues("content").length < 50
            ? "short"
            : form.getValues("content").length < 200
              ? "medium"
              : "long"
        }
        data-umami-event-has-code={
          form.getValues("content").includes("```") ? "true" : "false"
        }
      >
        Submit
      </SubmitButton>
    </form>
  );
}
