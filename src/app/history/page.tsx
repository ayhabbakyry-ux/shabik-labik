
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/store";
import Orders from "@/components/Orders";

export default function HistoryPage() {
  const { isLoggedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return <Orders initialTab="orders" />;
}
