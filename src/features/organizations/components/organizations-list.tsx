import { LucideUsers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
    <div>
      {organizations.map((organization) => (
        <div key={organization.id}>{organization.name}</div>
      ))}
    </div>
  );
}
