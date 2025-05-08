import './CharacterInfo.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CharacterInfoProps {
  characterName: string;
  characterTraits: string[];
  characterBio: string;
  characterImage: string;
}

const CharacterInfo: React.FC<CharacterInfoProps> = ({ characterName, characterTraits, characterBio, characterImage }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // 한글인지 확인
  const isKorean = i18n.language === 'kr' || i18n.language === 'ko' || i18n.language === 'ko-KR';

  return (
    <div className={`character-info${showDetails ? " open" : ""} component-container ${isKorean ? "korean-text" : ""}`}>
      <img src={characterImage} alt={characterName} className="character-image" />
      <h3>{characterName}</h3>
      <button onClick={toggleDetails}>
        {showDetails ? t('Hide Details') : t('Show Details')}
      </button>
      <div className="character-details">
        <div className="traits-container">
          <h4>{t('Traits')}</h4>
          <div className="traits-list">
            {characterTraits.map((trait, index) => (
              <div key={index} className="trait-item">{trait}</div>
            ))}
          </div>
        </div>
        <div className="bio-container">
          <h4>{t('Character Bio')}</h4>
          <p>{characterBio}</p>
        </div>
      </div>
    </div>
  );
};

export default CharacterInfo;
