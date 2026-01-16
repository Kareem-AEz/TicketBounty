import { format } from "date-fns";
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowRightLeft,
  LucideCheck,
  LucidePencil,
  LucideTrash2,
  LucideUsers,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { Fragment } from "react/jsx-runtime";
import SubmitButton from "@/components/form/submit-button";
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
import { cn } from "@/lib/utils";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user-id";
import OrganizationSwitchButton from "./organization-switch-button";

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
            Actions
          </TableHead>
          <TableHead className="bg-background/95 backdrop-blur-sm"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <>
          {organizations.map((organization) => {
            const isActive = organization.membershipByUser.isActive;

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
                  >
                    {isActive ? "Active" : "Switch"}
                  </SubmitButton>
                }
              />
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
                  {format(
                    organization.membershipByUser.joinedAt,
                    "yyyy/MM/dd, hh:mm a",
                  )}
                </TableCell>
                <TableCell>{organization._count.memberships}</TableCell>
                <TableCell>
                  <div className="flex w-full gap-x-2">
                    {switchButton}
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
          })}
        </>
      </TableBody>
    </Table>
  );
}
