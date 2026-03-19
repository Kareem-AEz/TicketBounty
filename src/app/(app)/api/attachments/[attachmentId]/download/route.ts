import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { MAX_ATTACHMENT_LIVE_TIME_DOWNLOAD } from "@/features/attachments/constants";
import { generateS3Key } from "@/features/attachments/utils/generate-s3-key";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";

type DownloadAttachmentRouteProps = {
  params: Promise<{
    attachmentId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: DownloadAttachmentRouteProps,
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

    const key = generateS3Key({
      organizationId: attachment.storageOrganizationId,
      ticketId: attachment.storageTicketId,
      attachmentName: attachment.name,
      attachmentId: attachment.id,
    });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${attachment.name}"; filename*=UTF-8''${encodeURIComponent(attachment.name)}`,
    });
    const url = await getSignedUrl(s3, command, {
      expiresIn: MAX_ATTACHMENT_LIVE_TIME_DOWNLOAD,
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
