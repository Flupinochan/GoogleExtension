import { useAppTheme } from "@/entrypoints/utils/theme";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useRef } from "react";

interface TranslationPopupProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
  isLoading?: boolean;
}

export function TranslationPopup(props: TranslationPopupProps) {
  const theme = useAppTheme();
  const { text, position, onClose, isLoading = false } = props;
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // ポップアップ表示直後のクリックを無視するための遅延
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <ThemeProvider theme={theme}>
      <Paper
        ref={popupRef}
        elevation={8}
        role="dialog"
        aria-label="Translation popup"
        sx={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 10000,
          maxWidth: 600,
          minWidth: 120,
          p: 1.5,
          opacity: 0,
          transform: "translateY(-10px) scale(0.95)",
          animation: "popupAppear 0.2s ease-out forwards",
          "@keyframes popupAppear": {
            to: {
              opacity: 1,
              transform: "translateY(0) scale(1)",
            },
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body1">Translating...</Typography>
          </Box>
        ) : (
          <Typography variant="body1" sx={{ wordWrap: "break-word" }}>
            {text}
          </Typography>
        )}
      </Paper>
    </ThemeProvider>
  );
}
