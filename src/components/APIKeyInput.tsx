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
      console.log("Game state changed:", state.gameState);
      console.log("API key is set:", state.apiKey ? "Yes" : "No");
      
      // 명시적으로 페이지 이동
      navigate('/game');
    }
  }, [state.gameState, submitAttempted, navigate]);

  // Nous API 검증 함수
  const testNousAPI = async (key: string) => {
    try {
      console.log("Testing API key with Nous Research API...");
      
      const response = await fetch('https://inference-api.nousresearch.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Hermes-3-Llama-3.1-70B',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'hi' }
          ],
          max_tokens: 256
        })
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        console.error("API validation failed with status:", response.status);
        return false;
      }
      
      console.log("API key validation successful");
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log("API key submission attempt:", apiKey ? "Key exists" : "No key");
    
    if (!apiKey.trim()) {
      alert('Please enter your API key.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 실제 API 검증 수행
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
        
        console.log("State updated. Transitioning to game state...");
      } else {
        alert('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      alert('An error occurred while validating your API key.');
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
