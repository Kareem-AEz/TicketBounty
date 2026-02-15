import { z } from "zod/v4";

export const MAX_COMMENT_LENGTH = 6000;

export const formSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .max(MAX_COMMENT_LENGTH, "Comment is too long"),
});
