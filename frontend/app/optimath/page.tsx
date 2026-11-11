"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyMathStepRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
