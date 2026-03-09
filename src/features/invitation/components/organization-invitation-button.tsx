"use client";

import { LucidePlus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ActionState,
  EMPTY_ACTION_STATE,
} from "@/components/form/utils/to-action-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { inviteUser } from "../actions/invite-user";

export default function OrganizationInvitationButton({
  organizationId,
}: {
  organizationId: string;
}) {
  const [open, setOpen] = useState(false);

  const promiseRef = useRef<Promise<ActionState | undefined> | null>(null);
  const wrappedAction = async (state: ActionState, formData: FormData) => {
    const promise = inviteUser({
      organizationId,
      email: formData.get("email") as string,
    });
    promiseRef.current = promise;
    const result = await promise;
    return result ?? state;
  };

  const [_actionState, action, isPending] = useActionState(
    wrappedAction,
    EMPTY_ACTION_STATE,
  );

  useEffect(() => {
    if (isPending && promiseRef.current) {
      const promise = promiseRef.current.then((result) => {
        console.log(result);
        if (result?.status === "ERROR") {
          throw result;
        }
        return result;
      });

      toast.promise(promise, {
        loading: "Sending invitation...",
        success: (data) => {
          setOpen(false);
          return data?.message || "Invitation sent successfully";
        },
        error: (error) => {
          return error?.message || "Failed to send invitation";
        },
      });
    }
  }, [isPending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={"default"}>
          <LucidePlus />
          Invite Member
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form action={action} className="contents">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a member to your organization.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  name="email"
                  id="email"
                  defaultValue={_actionState.payload?.get("email") as string}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
