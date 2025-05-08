// APIKeyInput.tsx
import React, { useState, useContext } from "react";
import "./APIKeyInput.css";
import { AppContext } from "../AppContext";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const APIKeyInput: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const [apiKey, setApiKey] = useState<string>("");
  const { t } = useTranslation();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setState({ ...state, apiKey, gameState: "loadOrCreate" });
  };

  return (
    <>
      <div className="api-wrapper">
      <LanguageSelector />
        <h2>{t('Enter your Nous Research API key')}</h2>
        <div className="api-container">
          <form onSubmit={handleSubmit} className="api-input">
            <input
              type="text"
              placeholder={t('Nous API key')}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              autoComplete="api-key"
              required
            />
            <button type="submit">{t('Submit')}</button>
          </form>
          <p>
            {t('This is all run in the browser so the API key is private;')}
          </p>
          <p>
            {t('it is used to generate your own story.')}
          </p>
          <p>
            {t('Get your API key from')}{" "}
            <a
              href="https://portal.nousresearch.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('Nous Research Portal')}
            </a>.
          </p>
        </div>
      </div>
    </>
  );
};

export default APIKeyInput;
