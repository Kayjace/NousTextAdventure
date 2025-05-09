// APIKeyInput.tsx
import React, { useState, useContext } from "react";
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
    
    if (!apiKey.trim()) {
      alert(t('API 키를 입력해주세요.'));
      return;
    }

    setIsLoading(true);
    
    try {
      const isValid = await testNousAPI(apiKey);
      
      if (isValid) {
        // API 키가 유효한 경우에만 상태 업데이트 및 페이지 이동
        setState(prevState => ({ 
          ...prevState, 
          apiKey, 
          gameState: "loadOrCreate" 
        }));
        
        navigate('/game');
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
    <div className="api-key-input-container">
      <h1>{t('Welcome to AI Text Adventure')}</h1>
      <p>{t('Please enter your Nous API key to continue:')}</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={t('Enter your API key')}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? t('Verifying...') : t('Submit')}
        </button>
      </form>
      
      <div className="language-selector-container">
        <LanguageSelector />
      </div>
    </div>
  );
};

export default APIKeyInput;
