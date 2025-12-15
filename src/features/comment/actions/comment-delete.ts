"use server";

import { revalidatePath } from "next/cache";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import prisma from "@/lib/prisma";
import { ticketPath } from "@/paths";

export async function commentDelete(commentId: string) {
  const user = await getAuthOrRedirect();
  try {
    const comment = await prisma.ticketComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new Error("Comment not found");
    }
    if (comment.userId !== user.id) {
      throw new Error("You are not the owner of this comment");
    }

    await prisma.ticketComment.delete({
      where: { id: commentId },
    });

    revalidatePath(ticketPath(comment.ticketId));
    return {
      success: true,
      message: "Comment deleted",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
