"use server";

import { revalidatePath } from "next/cache";
import { bulkDeleteAttachmentsEvent } from "@/features/attachments/events/bulk-delete-attachments.event";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { AttachmentEntity } from "@/generated/enums";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { ticketPath } from "@/paths";

export async function commentDelete(commentId: string) {
  const user = await getAuthOrRedirect();
  try {
    const comment = await prisma.ticketComment.findUnique({
      where: { id: commentId },
      include: {
        attachments: true,
      },
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

    await inngest.send(
      bulkDeleteAttachmentsEvent.create({
        entity: AttachmentEntity.COMMENT,
        entityId: commentId,
        previousDeletedAt: comment.deletedAt,
        attachments: comment.attachments.map((attachment) => ({
          attachmentId: attachment.id,
          organizationId: attachment.storageOrganizationId,
          entityId: attachment.commentId,
          attachmentName: attachment.name,
        })) as {
          attachmentId: string;
          organizationId: string;
          entityId: string;
          attachmentName: string;
        }[],
      }),
    );

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
