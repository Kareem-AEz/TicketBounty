"use server";

import { revalidatePath } from "next/cache";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";
import { ticketPath } from "@/paths";
import { formSchema } from "../schema";

type CommentCreatePropsType = {
  content: string;
  ticketId: string;
};

export default async function commentCreate({
  content,
  ticketId,
}: CommentCreatePropsType) {
  const user = await getAuthOrRedirect();

  try {
    const { content: validatedContent } = formSchema.parse({
      content,
    });

    const comment = await prisma.ticketComment.create({
      data: {
        content: validatedContent,
        ticketId,
        userId: user.id,
      },
    });

    revalidatePath(ticketPath(ticketId));

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
