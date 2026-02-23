import type { ReactNode } from "react";
import { requireUserWithRole } from "@/lib/auth";

export default async function DoctorLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUserWithRole("doctor");
  return <>{children}</>;
}

