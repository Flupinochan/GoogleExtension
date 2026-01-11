import { useEffect, useState } from "react";

export interface OverlayStyle {
  top: number;
  left: number;
  width: number;
  height: number;
  opacity: number;
}

/**
 * カーソル上のDOM位置を返却するカスタムフック
 */
export function useMouseTracking(enabled: boolean, translating: boolean) {
  const [style, setStyle] = useState<OverlayStyle>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (!enabled && !translating) {
      return;
    }

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

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [enabled, translating]);

  return style;
}
