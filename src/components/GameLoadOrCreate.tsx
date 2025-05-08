// GameLoadOrCreate.tsx
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../AppContext';
import MyStories from './MyStories';
import './GameLoadOrCreate.css';

const GameLoadOrCreate: React.FC = () => {
  const { setState } = useContext(AppContext);
  const { t } = useTranslation();

  const handleCreate = () => {
    setState(prevState => ({ ...prevState, gameState: 'genreSelection' }));
  };

  return (
    <div className="center">
      <div className="main-actions">
        <div className="action-card">
          <div className="action-card-icon">🎮</div>
          <h2>{t('New Adventure')}</h2>
          <p>{t('Start a fresh journey with new characters, worlds, and stories.')}</p>
          <button className="game-button shine" onClick={handleCreate}>
            {t('Start New Game')}
          </button>
        </div>
        
        <div className="action-card">
          <div className="action-card-icon">📚</div>
          <h2 className="smaller-title">{t('Continue Adventure')}</h2>
          <p>{t('Resume your previous adventures and continue your journey.')}</p>
          <button 
            className="game-button"
            onClick={() => document.getElementById('saved-stories-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('View Saved Games')}
          </button>
        </div>
      </div>
      
      <div id="saved-stories-section" className="stories-section">
        <h2>{t('Your Saved Adventures')}</h2>
        <MyStories />
      </div>
    </div>
  );
};

export default GameLoadOrCreate;
