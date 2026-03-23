import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { MAX_ATTACHMENT_LIVE_TIME_PREVIEW } from "@/features/attachments/constants";
import { generateS3Key } from "@/features/attachments/utils/generate-s3-key";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";

type PreviewAttachmentRouteProps = {
  params: Promise<{
    attachmentId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: PreviewAttachmentRouteProps,
) {
  const { attachmentId } = await params;

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

    let entityId: string;
    switch (attachment.entity) {
      case AttachmentEntity.TICKET:
        if (!attachment.ticketId)
          throw new Error("Attachment with entity TICKET has no ticketId");
        entityId = attachment.ticketId;
        break;
      case AttachmentEntity.COMMENT:
        if (!attachment.commentId)
          throw new Error("Attachment with entity COMMENT has no commentId");
        entityId = attachment.commentId;
        break;
      default:
        throw new Error("Invalid attachment entity");
    }

    const key = generateS3Key({
      entity: attachment.entity,
      organizationId: attachment.storageOrganizationId,
      entityId,
      attachmentName: attachment.name,
      attachmentId: attachment.id,
    });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `inline; filename="${attachment.name}"; filename*=UTF-8''${encodeURIComponent(attachment.name)}`,
    });
    const url = await getSignedUrl(s3, command, {
      expiresIn: MAX_ATTACHMENT_LIVE_TIME_PREVIEW,
    });

    return NextResponse.redirect(url);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
