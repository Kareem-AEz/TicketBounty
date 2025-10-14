"use server";

import { revalidatePath } from "next/cache";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";
import { ticketPath } from "@/paths";
import { formSchema } from "../schema";

type CommentUpsertPropsType = {
  content: string;
  ticketId: string;
  commentId?: string;
};

export default async function commentUpsert({
  content,
  ticketId,
  commentId,
}: CommentUpsertPropsType) {
  const user = await getAuthOrRedirect();

  try {
    const { content: validatedContent } = formSchema.parse({
      content,
    });

    const comment = await prisma.ticketComment.upsert({
      where: {
        id: commentId || "",
      },
      update: {
        content: validatedContent,
      },
      create: {
        content: validatedContent,
        ticketId,
        userId: user.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        ticketId: true,
        user: {
          select: {
            username: true,
          },
        },
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
