import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import MemberDeleteButton from "@/features/organizations/components/member-delete-button";
import { getOrganizationMembers } from "@/features/organizations/queries/get-organization-members";
import { MembershipRole } from "@/generated/enums";
import { getMembership } from "../queries/get-membership";
import MemberRoleSelect from "./member-role-select";

type OrganizationMembersListProps = {
  organizationId: string;
};
export default async function OrganizationMembersList({
  organizationId,
}: OrganizationMembersListProps) {
  const user = await getAuthOrRedirect();
  const members = await getOrganizationMembers(organizationId);
  const userMembership = await getMembership(organizationId, user.id);

  const isUserAdmin = userMembership?.membershipRole === MembershipRole.ADMIN;

  return (
    <Table containerClassName="overflow-visible px-4   " className="w-full">
      <TableCaption>A list of your organizations.</TableCaption>
      <TableHeader className="sticky top-14 z-10">
        <TableRow>
          <TableHead className="bg-background/95 backdrop-blur-sm">
            Username
          </TableHead>
          <TableHead className="bg-background/95 w-[250px] backdrop-blur-sm">
            Role
          </TableHead>
          <TableHead className="bg-background/95 backdrop-blur-sm">
            Email
          </TableHead>
          <TableHead className="bg-background/95 backdrop-blur-sm">
            Joined At
          </TableHead>
          <TableHead className="bg-background/95 backdrop-blur-sm">
            Verified
          </TableHead>
          <TableHead className="bg-background/95 backdrop-blur-sm">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const isCurrentUser = member.userId === user.id;
          const deleteMemberButton = (
            <MemberDeleteButton
              memberId={member.userId}
              organizationId={organizationId}
            />
          );

          return (
            <TableRow key={member.userId}>
              <TableCell>
                {isCurrentUser ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-default items-center gap-x-3">
                        {member.user.username}
                        <span className="text-muted-foreground trati font-mono text-xs">
                          (You)
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <span className="text-muted-foreground font-mono text-xs">
                        That&apos;s you!
                      </span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  member.user.username
                )}
              </TableCell>
              <TableCell className="text-muted-foreground w-[250px] font-mono text-xs tracking-wider uppercase">
                {isUserAdmin ? (
                  <MemberRoleSelect
                    currentRole={member.membershipRole}
                    organizationId={organizationId}
                    userId={member.userId}
                  />
                ) : (
                  <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                    {member.membershipRole}
                  </span>
                )}
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                {format(member.joinedAt, "yyyy/MM/dd, hh:mm a")}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
                {member.user.emailVerified ? (
                  <span>[Verified]</span>
                ) : (
                  <span>[Un-verified]</span>
                )}
              </TableCell>
              <TableCell className="flex items-center gap-x-2">
                {isUserAdmin && deleteMemberButton}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
