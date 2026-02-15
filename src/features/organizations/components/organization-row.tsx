"use client";

import { format } from "date-fns";
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowRightLeft,
  LucideCheck,
  LucideExternalLink,
  LucideInfo,
  LucidePencil,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Link from "next/link";
import SubmitButton from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { organizationPath } from "@/paths";
import { useDeletingUserOrganization } from "../contexts/deleting-organization-context";
import { getMyOrganizations } from "../queries/get-my-organizations";
import MemberDeleteButton from "./member-delete-button";
import OrganizationDeleteButton from "./organization-delete-button";
import OrganizationSwitchButton from "./organization-switch-button";

type Organization = Awaited<ReturnType<typeof getMyOrganizations>>[number];

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
    <Button asChild variant="outline" size="icon" disabled={isAnyDeleting}>
      <Link href={organizationPath(organization.id)}>
        <LucideExternalLink />
      </Link>
    </Button>
  );

  const leaveButton = (
    <MemberDeleteButton
      memberId={organization.membershipByUser.userId}
      organizationId={organization.id}
    />
  );

  const deleteButton = (
    <OrganizationDeleteButton organizationId={organization.id} />
  );

  const buttons = (
    <>
      {switchButton}
      {!limitedAccess && viewButton}
      {!limitedAccess && editButton}
      {!limitedAccess && leaveButton}
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
      <TableCell className="">{organization.id}</TableCell>
      <TableCell>{organization.name}</TableCell>
      <TableCell>
        {format(organization.membershipByUser.joinedAt, "yyyy/MM/dd, hh:mm a")}
      </TableCell>
      <TableCell>{organization._count.memberships}</TableCell>
      <TableCell className="font-mono tracking-wider capitalize">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-default items-center gap-x-2">
              <span className="flex items-center gap-x-1">
                {organization.membershipByUser.membershipRole}{" "}
                <LucideInfo className="text-muted-foreground size-3.5 -translate-y-[0.3px]" />
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <span className="text-muted-foreground font-mono text-xs">
              {organization.membershipByUser.membershipRole === "ADMIN"
                ? "You are the admin of the organization."
                : "You are a member of the organization."}
            </span>
          </TooltipContent>
        </Tooltip>
      </TableCell>
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
