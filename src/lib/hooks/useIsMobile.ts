import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Use media query for more accurate detection
    const mobileMediaQuery = window.matchMedia("(pointer: coarse)");
    const smallScreenQuery = window.matchMedia("(max-width: 768px)");

    const updateDevice = () => {
      // Device is mobile if it has coarse pointer OR is small screen with touch
      setIsMobile(
        mobileMediaQuery.matches ||
          (smallScreenQuery.matches && "ontouchstart" in window),
      );
    };

    updateDevice();

    // Listen to media query changes (better than resize)
    mobileMediaQuery.addEventListener("change", updateDevice);
    smallScreenQuery.addEventListener("change", updateDevice);

    // Fallback: also listen to resize for edge cases
    window.addEventListener("resize", updateDevice);

    return () => {
      mobileMediaQuery.removeEventListener("change", updateDevice);
      smallScreenQuery.removeEventListener("change", updateDevice);
      window.removeEventListener("resize", updateDevice);
    };
  }, []);

  return isMobile;
};
