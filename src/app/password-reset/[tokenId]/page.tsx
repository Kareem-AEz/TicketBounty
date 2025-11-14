import Link from "next/link";
import { CardCompact } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import PasswordResetForm from "@/features/password/components/password-reset-form";
import { signInPath } from "@/paths";

export default async function PasswordResetPage({
  params,
}: {
  params: Promise<{ tokenId: string }>;
}) {
  const { tokenId } = await params;

  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Separator className="mb-8" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Reset Password"
          description="Reset your password by entering a new one below."
          className="animate-fade-from-top w-full max-w-md"
          content={<PasswordResetForm tokenId={tokenId} />}
          footer={
            <>
              <Link
                href={signInPath()}
                className="text-muted-foreground text-sm"
              >
                Remember your password? Sign In
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
