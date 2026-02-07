import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login?redirect=/checkout");
  }

  return (
    <Suspense>
      <CheckoutClient />
    </Suspense>
  );
}
