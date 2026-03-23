import { LucidePaperclip } from "lucide-react";
import { useState } from "react";
import SubmitButton from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AttachmentEntity } from "@/generated/enums";
import AttachmentForm from "./attachment-form";

export default function AttachmentCreateButton({
  entity,
  entityId,
}: {
  entity: AttachmentEntity;
  entityId: string;
}) {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <LucidePaperclip className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md!">
        <DialogHeader>
          <DialogTitle>Attach a file</DialogTitle>
          <DialogDescription>
            Attach a file to your {entity === "TICKET" ? "ticket" : "comment"}.
          </DialogDescription>
        </DialogHeader>

        <AttachmentForm
          entityId={entityId}
          entity={entity}
          buttons={
            <DialogFooter className="mx-0 w-full flex-1 border-t-0 px-0 pt-0">
              <Button
                className="flex-1"
                type="button"
                variant="outline"
                size={"lg"}
                onClick={handleCancel}
              >
                Cancel
              </Button>

              <SubmitButton
                className="flex-1"
                size={"lg"}
                pendingLabel="Uploading..."
              >
                Upload
              </SubmitButton>
            </DialogFooter>
          }
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
