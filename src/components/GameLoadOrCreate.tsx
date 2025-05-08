// GameLoadOrCreate.tsx
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next'; // i18n 훅 추가
import { AppContext } from '../AppContext';
import MyStories from './MyStories';
import './GameLoadOrCreate.css';

const GameLoadOrCreate: React.FC = () => {
  const { setState } = useContext(AppContext);
  const { t } = useTranslation(); // 번역 함수 가져오기

  const handleCreate = () => {
    setState(prevState => ({ ...prevState, gameState: 'genreSelection' }));
  };

  return (
    <div className="center">
      <button className="game-button shine" onClick={handleCreate}>
        {t('Start New Game')} {/* 하드코딩된 텍스트를 t() 함수로 감싸기 */}
      </button>
      <MyStories />
    </div>
  );
};

export default GameLoadOrCreate;
