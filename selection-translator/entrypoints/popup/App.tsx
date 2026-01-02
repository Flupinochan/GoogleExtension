import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { enabledStorage, LanguageCode, LANGUAGES, languageStorage } from '../utils/local-storage';
import Switch from '@mui/material/Switch';

const AppContainer = styled.div`
  width: 200px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-size: 18px;
`;

const GlassSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 8px;
  color: white;
  outline: none;

  option {
    background: #333;
    color: white;
  }
`;

function App() {
  const [language, setLanguage] = useState<LanguageCode>('ja');
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await languageStorage.getValue();
      setLanguage(saved);
    };
    const loadEnabled = async () => {
      const saved = await enabledStorage.getValue();
      setEnabled(saved);
    }
    loadLanguage();
    loadEnabled();
  }, []);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as LanguageCode;
    setLanguage(newLanguage);
    await languageStorage.setValue(newLanguage);
  };

  const handleEnableToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setEnabled(enabled)
    await enabledStorage.setValue(enabled);
  }

  return (
    <AppContainer>
      <div className="glass-container">
        <div className="form-group">
          <Switch onChange={handleEnableToggle} checked={enabled}></Switch>
        </div>
        <div className="form-group" style={{ marginTop: '15px' }}>
          <Label>Translate to</Label>
          <GlassSelect
            value={language}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </GlassSelect>
        </div>
      </div>
    </AppContainer>
  );
}

export default App;