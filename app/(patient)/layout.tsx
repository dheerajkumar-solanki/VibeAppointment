import type { ReactNode } from "react";
import { requireUserWithRole } from "@/lib/auth";

export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUserWithRole("patient");
  return <>{children}</>;
}

