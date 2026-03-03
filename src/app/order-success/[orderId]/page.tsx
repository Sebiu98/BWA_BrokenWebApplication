"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LegacyOrderSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/order-success");
  }, [router]);

  return null;
};

export default LegacyOrderSuccessPage;
