import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { MAX_ATTACHMENT_LIVE_TIME_PREVIEW } from "@/features/attachments/constants";
import { attachmentsDB } from "@/features/attachments/db";
import { attachmentSubjectDTO } from "@/features/attachments/dto";
import { generateS3Key } from "@/features/attachments/utils/generate-s3-key";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";

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

    const attachment = await attachmentsDB.getAttachment({
      attachmentId,
      include: {
        ticket: true,
        comment: true,
      },
    });
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    let subject;

    switch (attachment.entity) {
      case AttachmentEntity.TICKET:
        if (!attachment.ticket) throw new Error("Ticket not found");
        const ticket = {
          ...attachment.ticket,
          entity: AttachmentEntity.TICKET,
        };
        subject = attachmentSubjectDTO.fromTicket(ticket);
        break;
      case AttachmentEntity.COMMENT:
        if (!attachment.comment) throw new Error("Comment not found");
        const comment = {
          ...attachment.comment,
          entity: AttachmentEntity.COMMENT,
        };
        subject = attachmentSubjectDTO.fromComment(comment);
        break;
    }

    if (!subject) throw new Error("Subject not found");

    const key = generateS3Key({
      entity: attachment.entity,
      organizationId: attachment.storageOrganizationId,
      entityId: subject.entityId,
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
