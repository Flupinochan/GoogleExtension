import { onMessage } from "@/entrypoints/utils/messaging";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMouseTracking } from "../hooks/useMouseTracking";
import { DomSelectorOverlay } from "./DomSelectorOverlay";
import { translateTextNodes } from "./domTranslation";

export const DomSelector = () => {
  const [domSelectorEnabled, setDomSelectorEnabled] = useState(false);
  const [translating, setTranslating] = useState(false);
  const style = useMouseTracking(domSelectorEnabled, translating);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDomSelectorEnabled(false);
      }
    };

    const handleDomClick = async (event: MouseEvent) => {
      if (!domSelectorEnabled) return;

      setTranslating(true);
      setDomSelectorEnabled(false);

      try {
        const target = event.target as HTMLElement;
        await translateTextNodes(target);
      } finally {
        setTranslating(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleDomClick);
    const unsubscribe = onMessage("domSelectorEnabled", (_message) => {
      setDomSelectorEnabled(true);
    });

    return () => {
      document.removeEventListener("click", handleDomClick);
      document.removeEventListener("keydown", handleEscape);
      unsubscribe();
    };
  }, [domSelectorEnabled, translating]);

  return createPortal(
    domSelectorEnabled || translating ? (
      <DomSelectorOverlay style={style} translating={translating} />
    ) : null,
    document.body
  );
};
