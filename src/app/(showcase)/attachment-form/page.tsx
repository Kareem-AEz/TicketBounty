import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AttachmentForm from "@/features/attachments/components/attachment-form";

export default function AttachmentFormPage() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="border-muted/80 w-full max-w-xl">
        <CardHeader>
          <CardTitle>Attachment Form</CardTitle>
          <CardDescription>Add attachments to your ticket</CardDescription>
        </CardHeader>
        <CardContent>
          <AttachmentForm ticketId="123" />
        </CardContent>
      </Card>
    </div>
  );
}
