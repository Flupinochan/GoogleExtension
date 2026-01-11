import { OverlayStyle } from "../hooks/useMouseTracking";

interface DomSelectorOverlayProps {
  style: OverlayStyle;
  translating: boolean;
}

export function DomSelectorOverlay({
  style,
  translating,
}: DomSelectorOverlayProps) {
  return (
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
  );
}
