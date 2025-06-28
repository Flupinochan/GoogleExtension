import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LanguageCode, LANGUAGES, languageStorage } from '../utils/local-storage';

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

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await languageStorage.getValue();
      setLanguage(saved);
    };
    loadLanguage();
  }, []);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as LanguageCode;
    setLanguage(newLanguage);
    await languageStorage.setValue(newLanguage);
  };

  return (
    <AppContainer>
      <div className="glass-container">
        <div className="form-group">
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