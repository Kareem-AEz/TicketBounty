"use client";

import { format } from "date-fns";
import { AlertCircle } from "lucide-react";
import { useOptimistic } from "react";
import { ActionState } from "@/components/form/utils/to-action-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma } from "@/generated/client";
import DeleteInvitationButton from "./delete-invitation-button";

type Invitation = Prisma.InvitationsGetPayload<{
  include: {
    invitedByUser: {
      select: {
        email: true;
        username: true;
      };
    };
  };
}>;

type InvitationListProps = {
  invitations: ActionState<Invitation[]>;
  organizationId: string;
};

export default function InvitationList({
  invitations,
  organizationId,
}: InvitationListProps) {
  const [optimisticInvitations, setOptimisticInvitations] = useOptimistic(
    invitations.data ?? [],
    (state: Invitation[], removedInvitation: Invitation) =>
      state.filter(
        (invitation) => invitation.tokenHash !== removedInvitation.tokenHash,
      ),
  );

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
          {optimisticInvitations.map((invitation) => {
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
                <TableCell>
                  <DeleteInvitationButton
                    tokenHash={invitation.tokenHash}
                    organizationId={organizationId}
                    onSuccess={() => {
                      setOptimisticInvitations(invitation);
                    }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
