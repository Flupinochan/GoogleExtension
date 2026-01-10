import {
  Box,
  Button,
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
import { sendMessage } from "../utils/messaging";
import {
  enabledStorage,
  LANGUAGES,
  type LanguageCode,
  languageStorage,
} from "../utils/storage";

function App() {
  const [language, setLanguage] = useState<LanguageCode | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedLanguage, savedEnabled] = await Promise.all([
        languageStorage.getValue(),
        enabledStorage.getValue(),
      ]);
      setLanguage(savedLanguage);
      setEnabled(savedEnabled);
    };
    loadSettings();
  }, []);

  const handleLanguageChange = async (e: SelectChangeEvent) => {
    const language = e.target.value as LanguageCode;
    setLanguage(language);
    await languageStorage.setValue(language);
  };

  const handleEnableToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setEnabled(enabled);
    await enabledStorage.setValue(enabled);
  };

  const handleDomSelector = async (_e: React.MouseEvent<HTMLButtonElement>) => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    window.close();
    if (tab.id) {
      await sendMessage("domSelectorEnabled", true, tab.id);
    }
  };

  const handleAllTranslation = async (
    _e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    window.close();
    if (tab.id) {
      await sendMessage("allTranslation", undefined, tab.id);
    }
  };

  if (language === null || enabled === null) {
    return null;
  }

  return (
    <Box sx={{ width: 200, height: 250, p: 2 }}>
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
        <Button variant="outlined" onClick={handleDomSelector}>
          DOM CLICK
        </Button>
        <Button variant="outlined" onClick={handleAllTranslation}>
          ALL
        </Button>
      </Stack>
    </Box>
  );
}

export default App;
