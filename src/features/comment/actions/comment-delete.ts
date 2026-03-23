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

    const entityId = comment.id;

    await inngest.send(
      bulkDeleteAttachmentsEvent.create({
        entity: AttachmentEntity.COMMENT,
        entityId,
        previousDeletedAt: comment.deletedAt,
        attachments: comment.attachments.map((attachment) => ({
          attachmentId: attachment.id,
          organizationId: attachment.storageOrganizationId,
          entityId,
          attachmentName: attachment.name,
        })),
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
