import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { onMessage } from "@/entrypoints/utils/messaging";
import { translateStreaming } from "./translation";

export const DomSelector = () => {
  const [style, setStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });
  const [domSelectorEnabled, setDomSelectorEnabled] = useState(false);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (translating) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (
        !target ||
        target === document.body ||
        target === document.documentElement ||
        target.closest("#chrome-extension-react-root")
      ) {
        setStyle((prev) => ({ ...prev, opacity: 0 }));
        return;
      }
      const rect = target.getBoundingClientRect();
      setStyle({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        opacity: 1,
      });
    };

    const handleDomClick = async (event: MouseEvent) => {
      if (!domSelectorEnabled) return;
      setTranslating(true);
      setDomSelectorEnabled(false);

      try {
        const target = event.target as HTMLElement;
        console.log(target);

        const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, {
          acceptNode: (node) =>
            node.parentElement?.closest("pre, code, script, style")
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT,
        });

        let node: Node | null = walker.nextNode();
        while (node) {
          const text = node.textContent?.trim();

          if (text) {
            node.textContent = "";
            for await (const result of translateStreaming(text)) {
              if (result.isOk()) {
                node.textContent += result.value;
              } else {
                node.textContent = text;
                console.error(
                  `Failed to translate "${text}": ${result.error.message}`,
                );
                break;
              }
            }
          }

          node = walker.nextNode();
        }
      } finally {
        setTranslating(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleDomClick);
    const unsubscribe1 = onMessage("domSelectorEnabled", (message) => {
      setDomSelectorEnabled(message.data);
    });
    const unsubscribe2 = onMessage("allTranslation", async (_message) => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) =>
            node.parentElement?.closest("pre, code, script, style")
              ? NodeFilter.FILTER_REJECT
              : NodeFilter.FILTER_ACCEPT,
        },
      );

      let node: Node | null = walker.nextNode();
      while (node) {
        const text = node.textContent?.trim();

        if (text) {
          node.textContent = "";
          for await (const result of translateStreaming(text)) {
            if (result.isOk()) {
              node.textContent += result.value;
            } else {
              node.textContent = text;
              console.error(
                `Failed to translate "${text}": ${result.error.message}`,
              );
              break;
            }
          }
        }

        node = walker.nextNode();
      }
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleDomClick);
      unsubscribe1?.();
      unsubscribe2?.();
    };
  }, [domSelectorEnabled, translating]);

  return createPortal(
    domSelectorEnabled || translating ? (
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          border: `2px solid ${translating ? "#ffc107" : "#2196f3"}`,
          backgroundColor: translating
            ? "rgba(255, 193, 7, 0.15)"
            : "rgba(33, 150, 243, 0.15)",
          zIndex: 99999,
          borderRadius: "5px",
          transition:
            "top 0.3s ease-out, left 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out, opacity 0.2s",
          top: `${style.top}px`,
          left: `${style.left}px`,
          width: `${style.width}px`,
          height: `${style.height}px`,
          opacity: style.opacity,
        }}
      />
    ) : null,
    document.body,
  );
};
