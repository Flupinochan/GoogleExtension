import { storage } from '#imports';
import { useState, useEffect } from 'react';
import './App.css';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ko', name: '한국어' },
] as const;

type LanguageCode = typeof LANGUAGES[number]['code'];

export const languageStorage = storage.defineItem<LanguageCode>('local:selectedLanguage', {
  init: () => 'ja',
});

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
    <div className="app">
      <div className="glass-container">
        <div className="form-group">
          <label className="label">Translate to</label>
          <select
            className="glass-select"
            value={language}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;