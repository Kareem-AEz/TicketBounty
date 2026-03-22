import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateS3Key } from "@/features/attachments/utils/generate-s3-key";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";

export async function getAttachmentPreview(attachmentId: string) {
  const user = await getAuthOrRedirect();

  try {
    if (!user) {
      throw new Error("Unauthorized");
    }

    const attachment = await prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
    });
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    // -- ENFORCE SINGLE FK INVARIANT --
    // Each attachment must belong to exactly one entity. If both FKs are set
    // or neither is, the record is corrupt and we should not serve it.
    const hasTicket = attachment.ticketId != null;
    const hasComment = attachment.commentId != null;

    if (hasTicket === hasComment) {
      throw new Error(
        hasTicket
          ? "Data integrity error: attachment is linked to both a ticket and a comment"
          : "Data integrity error: attachment has no entity reference",
      );
    }

    const entityId = (attachment.ticketId ?? attachment.commentId) as string;

    const key = generateS3Key({
      entityId,
      entity: attachment.entity,
      organizationId: attachment.storageOrganizationId,
      attachmentName: attachment.name,
      attachmentId: attachment.id,
    });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `inline; filename="${attachment.name}"`,
    });
    const url = await getSignedUrl(s3, command, {
      expiresIn: 5,
    });

    return { success: true, message: "Attachment previewed", url };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Internal server error" };
  }
}
