import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
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

  if (language === null || enabled === null) {
    return null;
  }

  return (
    <Box sx={{ width: 200, height: 200, p: 2 }}>
      <FormControlLabel
        control={<Switch checked={enabled} onChange={handleEnableToggle} />}
        label="Enable"
      />
      <FormControl fullWidth sx={{ mt: 2 }}>
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
    </Box>
  );
}

export default App;
