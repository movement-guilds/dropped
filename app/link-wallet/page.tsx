import { requireAuth } from "@/lib/auth-helpers";
import { LinkPrompt } from "@/components/wallet/LinkPrompt";

export default async function LinkWalletPage() {
  await requireAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <LinkPrompt />
    </div>
  );
}
