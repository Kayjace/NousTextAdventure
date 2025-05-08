// APIKeyInput.tsx
import React, { useState, useContext, useEffect } from "react";
import "./APIKeyInput.css";
import { AppContext } from "../AppContext";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { useNavigate } from 'react-router-dom';

const APIKeyInput: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const [apiKey, setApiKey] = useState<string>("");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

  // Submit 이후 상태 변화 감지
  useEffect(() => {
    if (submitAttempted && state.gameState === "loadOrCreate") {
      console.log("게임 상태가 변경됨:", state.gameState);
      console.log("API 키가 설정됨:", state.apiKey ? "설정됨" : "설정되지 않음");
      
      // 명시적으로 페이지 이동
      navigate('/game');
    }
  }, [state.gameState, submitAttempted, navigate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log("API 키 제출 시도:", apiKey ? "API 키 있음" : "API 키 없음");
    
    if (!apiKey.trim()) {
      alert(t('API 키를 입력해주세요.'));
      return;
    }
    
    // API 키와 게임 상태 설정
    setState(prevState => ({ 
      ...prevState, 
      apiKey, 
      gameState: "loadOrCreate" 
    }));
    
    // 제출 시도 플래그 설정
    setSubmitAttempted(true);
    
    console.log("상태 업데이트 완료. 게임 상태로 전환 중...");
    
    // 직접 경로 변경 (추가 안전장치)
    setTimeout(() => {
      if (window.location.pathname !== '/game') {
        console.log("수동으로 경로 변경");
        navigate('/game');
      }
    }, 500);
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
            <button 
              type="submit"
              onClick={() => console.log("버튼 클릭됨")}
            >
              {t('Submit')}
            </button>
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
