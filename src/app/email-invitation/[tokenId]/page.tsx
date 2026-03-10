import { CardCompact } from "@/components/card-compact";
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

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <CardCompact
        className="animate-fade-from-bottom w-full max-w-md"
        title="Email Invitation"
        description="Accept the invitation to join the organization"
        content={<InvitationAcceptForm tokenId={tokenId} />}
      />
    </div>
  );
}
