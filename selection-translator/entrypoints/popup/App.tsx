import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Switch,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { sendToContentScript } from "../utils/messaging";
import { retryPolicy } from "../utils/retry";
import {
  extensionEnabledStorage,
  LANGUAGES,
  type LanguageCode,
  targetLangStorage,
} from "../utils/storage";

function App() {
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedLanguage, savedEnabled] = await Promise.all([
        retryPolicy.execute(() => targetLangStorage.getValue()),
        retryPolicy.execute(() => extensionEnabledStorage.getValue()),
      ]);
      setLanguage(savedLanguage);
      setEnabled(savedEnabled);
    };
    loadSettings();
  }, []);

  const handleLanguageChange = async (e: SelectChangeEvent) => {
    const language = e.target.value as LanguageCode;
    setLanguage(language);
    await retryPolicy.execute(() => targetLangStorage.setValue(language));
  };

  const handleEnableToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setEnabled(enabled);
    await retryPolicy.execute(() => extensionEnabledStorage.setValue(enabled));
  };

  return (
    <Box sx={{ width: 200, height: 250, p: 2 }}>
      {language === null || enabled === null ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          <FormControlLabel
            control={<Switch checked={enabled} onChange={handleEnableToggle} />}
            label="Enable"
          />
          <FormControl fullWidth>
            <InputLabel>Translate to</InputLabel>
            <Select
              value={language}
              onChange={handleLanguageChange}
              label="Translate to"
            >
              {LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => sendToContentScript("domSelectorEnabled", undefined)}
          >
            DOM CLICK
          </Button>
          <Button
            variant="outlined"
            onClick={() => sendToContentScript("allTranslation", undefined)}
          >
            ALL
          </Button>
        </Stack>
      )}
    </Box>
  );
}

export default App;
