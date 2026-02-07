import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SiteShell } from "@/components/layout/SiteShell";

// Prevent prerendering for protected routes
// These routes require authentication and access localStorage
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return (
    <TooltipProvider>
      <SiteShell>{children}</SiteShell>
    </TooltipProvider>
  );
}

