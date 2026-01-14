import { format } from "date-fns";
import {
  LucideArrowRightLeft,
  LucidePencil,
  LucideTrash2,
  LucideUsers,
} from "lucide-react";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user-id";

export default async function OrganizationsList() {
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
            Create Organization
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Table containerClassName="overflow-visible px-4   " className="w-full">
      <TableCaption>A list of your organizations.</TableCaption>
      <TableHeader className="sticky top-14 z-10">
        <TableRow>
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
          <TableHead className="bg-background/95 text-center backdrop-blur-sm">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((organization) => (
          <TableRow key={organization.id}>
            <TableCell>{organization.id}</TableCell>
            <TableCell>{organization.name}</TableCell>
            <TableCell>
              {format(
                organization.membershipByUser.joinedAt,
                "yyyy/MM/dd, hh:mm a",
              )}
            </TableCell>
            <TableCell>{organization._count.memberships}</TableCell>
            <TableCell>
              <div className="flex w-full justify-center gap-x-2">
                <Button variant="outline" size="icon">
                  <LucideArrowRightLeft />
                </Button>
                <Button variant="outline" size="icon">
                  <LucideTrash2 />
                </Button>
                <Button variant="outline" size="icon">
                  <LucidePencil />
                </Button>
                <Button variant="outline" size="icon">
                  <LucideTrash2 />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
