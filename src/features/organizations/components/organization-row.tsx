"use client";

import { format } from "date-fns";
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowRightLeft,
  LucideCheck,
  LucideExternalLink,
  LucidePencil,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import SubmitButton from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDeletingUserOrganization } from "../contexts/deleting-organization-context";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user-id";
import OrganizationDeleteButton from "./organization-delete-button";
import OrganizationSwitchButton from "./organization-switch-button";

type Organization = Awaited<
  ReturnType<typeof getOrganizationsByUserId>
>[number];

type OrganizationRowProps = {
  organization: Organization;
  limitedAccess?: boolean;
};

export default function OrganizationRow({
  organization,
  limitedAccess = false,
}: OrganizationRowProps) {
  const { deletingUserOrganizationId } = useDeletingUserOrganization();
  const isActive = organization.membershipByUser.isActive;
  const isAnyDeleting = deletingUserOrganizationId === organization.id;

  const switchButton = (
    <OrganizationSwitchButton
      organizationId={organization.id}
      trigger={
        <SubmitButton
          variant={isActive ? "default" : "outline"}
          size="default"
          className={cn(
            "w-full min-w-32",
            isActive && "bg-primary text-primary-foreground",
          )}
          icon={isActive ? <LucideCheck /> : <LucideArrowRightLeft />}
          disabled={isAnyDeleting}
        >
          {isActive ? "Active" : "Switch"}
        </SubmitButton>
      }
    />
  );

  const editButton = (
    <Button variant="outline" size="icon" disabled={isAnyDeleting}>
      <LucidePencil />
    </Button>
  );

  const viewButton = (
    <Button variant="outline" size="icon" disabled={isAnyDeleting}>
      <LucideExternalLink />
    </Button>
  );

  const deleteButton = (
    <OrganizationDeleteButton organizationId={organization.id} />
  );

  const buttons = (
    <>
      {switchButton}
      {!limitedAccess && viewButton}
      {!limitedAccess && editButton}
      {!limitedAccess && deleteButton}
    </>
  );
  return (
    <TableRow className="relative" key={organization.id}>
      <TableCell>
        <AnimatePresence mode="popLayout">
          {isActive && (
            <motion.div
              layoutId="active-left-arrow"
              key="active-left-arrow"
              className="absolute top-1/2 left-0 z-10 flex -translate-x-[150%] -translate-y-1/2 items-center justify-center"
            >
              <LucideArrowRight className="text-primary size-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </TableCell>
      <TableCell>{organization.id}</TableCell>
      <TableCell>{organization.name}</TableCell>
      <TableCell>
        {format(organization.membershipByUser.joinedAt, "yyyy/MM/dd, hh:mm a")}
      </TableCell>
      <TableCell>{organization._count.memberships}</TableCell>
      <TableCell>
        <motion.div className="flex w-full gap-x-2">{buttons}</motion.div>
      </TableCell>
      <TableCell>
        <AnimatePresence mode="popLayout">
          {isActive && (
            <motion.div
              layoutId="active-right-arrow"
              key="active-right-arrow"
              className="absolute top-1/2 right-0 z-10 flex translate-x-[150%] -translate-y-1/2 items-center justify-center"
            >
              <LucideArrowLeft className="text-primary size-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </TableCell>
    </TableRow>
  );
}
