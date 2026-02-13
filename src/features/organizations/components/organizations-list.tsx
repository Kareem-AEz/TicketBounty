import { LucideUsers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createOrganizationPath } from "@/paths";
import { DeletingUserOrganizationProvider } from "../contexts/deleting-organization-context";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user-id";
import OrganizationRow from "./organization-row";

interface OrganizationsListProps {
  limitedAccess?: boolean;
}
export default async function OrganizationsList({
  limitedAccess = false,
}: OrganizationsListProps) {
  const organizations = await getOrganizationsByUserId();
  const isEmpty = organizations.length === 0;

  if (isEmpty) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LucideUsers />
          </EmptyMedia>
          <EmptyTitle>No organizations found</EmptyTitle>
          <EmptyDescription>
            You are not a member of any organization.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            <Link href={createOrganizationPath()}>Create Organization</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <DeletingUserOrganizationProvider>
      <Table containerClassName="overflow-visible px-4   " className="w-full">
        <TableCaption>A list of your organizations.</TableCaption>
        <TableHeader className="sticky top-14 z-10">
          <TableRow>
            <TableHead className="bg-background/95 backdrop-blur-sm"></TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm">
              ID
            </TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm">
              Name
            </TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm">
              Joined At
            </TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm">
              Members
            </TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm">
              Role
            </TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm">
              Actions
            </TableHead>
            <TableHead className="bg-background/95 backdrop-blur-sm"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((organization) => (
            <OrganizationRow
              key={organization.id}
              organization={organization}
              limitedAccess={limitedAccess}
            />
          ))}
        </TableBody>
      </Table>
    </DeletingUserOrganizationProvider>
  );
}
