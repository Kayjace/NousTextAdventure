import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css'; // CSS 파일 추가 필요

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const langCode = e.target.value;
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t('Language ')}
      </label>
      <select 
        id="language-select" 
        className="language-select" 
        defaultValue={i18n.language} 
        onChange={changeLanguage}
      >
        <option value="en">English</option>
        <option value="kr">한국어</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
