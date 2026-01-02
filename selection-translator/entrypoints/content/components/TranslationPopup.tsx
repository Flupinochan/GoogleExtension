import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useEffect, useRef } from "react";
import { useAppTheme } from "@/entrypoints/utils/theme";

interface TranslationPopupProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function TranslationPopup(props: TranslationPopupProps) {
  const theme = useAppTheme();

  const { text, position, onClose } = props;
  const popupRef = useRef<HTMLDivElement>(null);
  const isLoading = text === "Translating...";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <ThemeProvider theme={theme}>
      <Paper
        ref={popupRef}
        elevation={8}
        sx={{
          position: "absolute",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 10000,
          maxWidth: 320,
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
