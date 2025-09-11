"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { deleteCookie, getCookie } from "@/actions/cookies";

function RedirectToast() {
  useEffect(() => {
    const fetchToast = async () => {
      const message = await getCookie("toast");
      if (message) {
        toast.success(message);
        await deleteCookie("toast");
      }
    };

    fetchToast();
  }, []);

  return null;
}

export default RedirectToast;
