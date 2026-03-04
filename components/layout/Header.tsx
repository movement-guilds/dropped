import Link from "next/link";
import { LoginButton } from "@/components/auth/LoginButton";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-movement-dark">
      <Link href="/" className="font-bold text-white text-lg">
        Movement Guilds
      </Link>
      <LoginButton />
    </header>
  );
}
