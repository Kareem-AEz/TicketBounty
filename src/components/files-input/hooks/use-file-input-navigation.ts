import { useRef, useState } from "react";

export default function useFileInputNavigation({}) {
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(0);
  const deleteButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  return {
    state: {
      activeDeleteIndex,
    },
    handlers: {
      setActiveDeleteIndex,
    },
    refs: {
      deleteButtonRefs,
    },
  };
}
