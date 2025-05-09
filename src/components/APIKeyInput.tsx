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
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  // Nous API 검증 함수
  const testNousAPI = async (key: string) => {
    try {
      const response = await fetch('https://api.nousresearch.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nous-hermes-2-mixtral-8x7b-dpo',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 1
        })
      });

      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('API 키 검증 실패:', error);
      return false;
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log("API 키 제출 시도:", apiKey ? "API 키 있음" : "API 키 없음");
    
    if (!apiKey.trim()) {
      alert(t('API 키를 입력해주세요.'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // API 키 유효성 검증
      const isValid = await testNousAPI(apiKey);
      
      if (isValid) {
        // API 키가 유효한 경우에만 상태 업데이트
        setState(prevState => ({ 
          ...prevState, 
          apiKey, 
          gameState: "loadOrCreate" 
        }));
        
        // 제출 시도 플래그 설정
        setSubmitAttempted(true);
        
        console.log("상태 업데이트 완료. 게임 상태로 전환 중...");
      } else {
        alert(t('유효하지 않은 API 키입니다. 다시 확인해주세요.'));
      }
    } catch (error) {
      console.error('API 키 검증 중 오류:', error);
      alert(t('API 키 검증 중 오류가 발생했습니다.'));
    } finally {
      setIsLoading(false);
    }
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
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('Verifying...') : t('Submit')}
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
