import Link from "next/link";
import { CardCompact } from "@/components/card-compact";
import { buttonVariants } from "@/components/ui/button";
import { getAuth } from "@/features/auth/queries/get-auth";
import InvitationAcceptForm from "@/features/invitation/components/invitation-accept-form";
import { getInvitationByTokenId } from "@/features/invitation/queries/get-invitation-by-token-id";

type EmailInvitationPageProps = {
  params: Promise<{ tokenId: string }>;
};

export default async function EmailInvitationPage({
  params,
}: EmailInvitationPageProps) {
  const { tokenId } = await params;
  const invitation = await getInvitationByTokenId(tokenId);

  if (!invitation) {
    return <div>Invitation not found</div>;
  }

  const { user } = await getAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <CardCompact
        className="animate-fade-from-bottom w-full max-w-md"
        title="Email Invitation"
        description="Accept the invitation to join the organization"
        content={
          user ? (
            <InvitationAcceptForm tokenId={tokenId} />
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                You need to be signed up to accept this invitation.
              </p>
              <Link
                href={`/sign-up?invitationToken=${tokenId}&email=${invitation.email}`}
                className={buttonVariants()}
              >
                Sign up to accept
              </Link>
            </div>
          )
        }
      />
    </div>
  );
}
