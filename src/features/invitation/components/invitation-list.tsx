import { format } from "date-fns";
import { AlertCircle, LucideTrash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvitationsByOrganization } from "../queries/get-invitations-by-organization";

type InvitationListProps = {
  organizationId: string;
};

export default async function InvitationList({
  organizationId,
}: InvitationListProps) {
  const invitations = await getInvitationsByOrganization(organizationId);

  if (invitations.status === "ERROR") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4">
        <Alert variant="destructive" className="max-w-lg" role="alert">
          <AlertCircle className="size-4" />
          <AlertTitle>Couldn&apos;t load invitations</AlertTitle>
          <AlertDescription>{invitations.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Invited At</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.data?.map((invitation) => {
            const deleteButton = () => (
              <Button variant="destructive" size="icon">
                <LucideTrash2 className="size-4" />
              </Button>
            );
            return (
              <TableRow
                key={invitation.email}
                className="text-muted-foreground"
              >
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  {format(invitation.createdAt, "yyyy/MM/dd, hh:mm a")}
                </TableCell>
                <TableCell>
                  {invitation.invitedByUser?.email ?? "Deleted User"}
                </TableCell>
                <TableCell>{deleteButton()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
