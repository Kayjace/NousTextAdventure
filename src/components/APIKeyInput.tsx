// APIKeyInput.tsx
import React, { useState, useContext, useEffect } from "react";
import "./APIKeyInput.css";
import { AppContext } from "../AppContext";
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const APIKeyInput: React.FC = () => {
  const { state, setState } = useContext(AppContext);
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("Hermes-3-Llama-3.1-70B");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);
  
  const availableModels = [
    'Hermes-3-Llama-3.1-70B',
    'DeepHermes-3-Llama-3-8B-Preview',
    'DeepHermes-3-Mistral-24B-Preview',
    'Hermes-3-Llama-3.1-405B'
  ];

  // 지갑 연결 상태 확인 함수
  const checkWalletConnection = async () => {
    // 로컬 스토리지에서 현재 연결된 지갑 주소 확인
    const currentWalletAddress = localStorage.getItem('current_wallet_address');
    
    // 서명 검증 상태 확인
    if (currentWalletAddress) {
      const verifiedStatus = localStorage.getItem(`signature_verified_${currentWalletAddress}`);
      const authToken = localStorage.getItem(`auth_token_${currentWalletAddress}`);
      
      if (verifiedStatus === 'true' && authToken) {
        // 인증된 지갑이 있으면 연결 상태 설정
        setWalletConnected(true);
        return;
      }
    }
    
    // 메타마스크 연결 확인
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.listAccounts();
        
        if (accounts.length > 0) {
          const address = accounts[0].address;
          
          // 서명 검증 상태 확인
          const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
          const authToken = localStorage.getItem(`auth_token_${address}`);
          
          if (verifiedStatus === 'true' && authToken) {
            // 인증된 지갑이 있으면 연결 상태 설정
            setWalletConnected(true);
          } else {
            setWalletConnected(false);
          }
        } else {
          setWalletConnected(false);
        }
      } catch (error) {
        console.log('No wallet connection detected');
        setWalletConnected(false);
      }
    }
  };

  // 지갑 연결 이벤트 리스너
  useEffect(() => {
    checkWalletConnection();
    
    // 지갑 연결 이벤트 리스너 추가
    const handleAccountsChanged = () => {
      console.log('Accounts changed, checking wallet connection...');
      checkWalletConnection();
    };
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    // 주기적으로 지갑 연결 상태 확인 (1초마다)
    const interval = setInterval(() => {
      checkWalletConnection();
    }, 1000);
    
    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      clearInterval(interval);
    };
  }, []);

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
      console.log("Testing API key with Nous Research API...");
      
      const response = await fetch('https://inference-api.nousresearch.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
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
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // 지갑 연결 확인
    if (!walletConnected) {
      alert('Please connect your wallet first to use the API.');
      return;
    }
    
    console.log("API 키 제출 시도:", apiKey ? "API 키 있음" : "API 키 없음");
    
    if (!apiKey.trim()) {
      alert(t('API 키를 입력해주세요.'));
      return;
    }
    
    setIsLoading(true);
    
    // API 키 유효성 검증 (비동기)
    testNousAPI(apiKey).then(isValid => {
      if (isValid) {
        // API 키와 게임 상태 설정
        setState(prevState => ({ 
          ...prevState, 
          apiKey,
          selectedModel,
          gameState: "loadOrCreate" 
        }));
        
        // 제출 시도 플래그 설정
        setSubmitAttempted(true);
        
        console.log("상태 업데이트 완료. 게임 상태로 전환 중...");
      } else {
        alert('Invalid API key. Please check and try again.');
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error validating API key:', error);
      alert('An error occurred while validating your API key.');
      setIsLoading(false);
    });
  };

  return (
    <>
      <div className="api-wrapper">
      <LanguageSelector />
        <h2>{t('Enter your Nous Research API key')}</h2>
        <div className="api-container">
          {!walletConnected ? (
            <div className="wallet-connection-required">
              <p className="wallet-message">Please connect your wallet to continue.</p>
              <p className="wallet-info">You need to connect and verify your wallet before using the API.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="api-input">
              <div className="form-group">
                <label htmlFor="apiKey">{t('API Key')}</label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('Enter your API key')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="modelSelect">{t('Select Model')}</label>
                <select
                  id="modelSelect"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="model-select"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                onClick={() => console.log("버튼 클릭됨")}
              >
                {isLoading ? t('Verifying...') : t('Submit')}
              </button>
            </form>
          )}
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
