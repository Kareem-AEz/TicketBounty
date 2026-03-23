import { motion } from "motion/react";
import { ReactNode } from "react";
import { Attachment } from "@/generated/client";
import AttachmentItem from "./attachmet-item";

type AttachmentsListProps = {
  attachments: Attachment[];
  buttons: (attachmentId: string) => ReactNode;
};

export default function AttachmentsList({
  attachments,
  buttons,
}: AttachmentsListProps) {
  // -- THE ATTACHMENTS LIST --
  // Renders a list of attachments—if any exist—by mapping them to AttachmentItem components.
  // Each AttachmentItem displays a single attachment.
  // Note: `isOwner` prop usage is removed for now, as this component does not receive/isOwner. Extend Signature If Needed.
  // As per project convention, we do not render anything if the list is empty.

  return (
    <div className="flex flex-col gap-y-2">
      {attachments.map((attachment) => {
        return (
          <motion.div layout="position" key={attachment.id}>
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              buttons={buttons(attachment.id)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
