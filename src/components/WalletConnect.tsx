import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import './WalletConnect.css';

// Web3 타입 확장 - window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// 서명 메시지 생성
const generateSignMessage = (address: string): string => {
  const timestamp = Date.now();
  return `Welcome to Nous Text Adventure!\n\nThis signature is used to verify you are the owner of this address: ${address}\n\nTimestamp: ${timestamp}\n\nThis signature does not cost any gas fees and does not authorize any transactions.`;
};

// 지갑 연결 컴포넌트
const WalletConnect: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [displayAddress, setDisplayAddress] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isSigningMessage, setIsSigningMessage] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 지갑 연결 체크
  useEffect(() => {
    // 로컬 스토리지에서 연결 상태 확인
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await ethProvider.listAccounts();
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            
            // 서명 확인
            const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
            if (verifiedStatus === 'true') {
              // 이미 서명된 지갑이라면 연결 상태로 설정
              setAccount(address);
              setIsConnected(true);
              setIsVerified(true);
              setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
              setProvider(ethProvider);
            } else {
              // 지갑은 연결되어 있지만 서명은 되지 않은 경우, 서명 요청
              try {
                await requestSignature(address, ethProvider);
              } catch (error) {
                console.error('자동 서명 요청 중 오류:', error);
                // 서명 거부 시 연결을 취소한 것으로 간주
              }
            }
          }
        } catch (error) {
          console.error('지갑 연결 확인 중 오류:', error);
        }
      }
    };

    checkConnection();

    // 이벤트 구독: 계정 변경
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // 계정 변경 시 서명 상태 확인
          const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
          if (verifiedStatus === 'true') {
            // 이미 서명된 지갑이라면 바로 연결
            setAccount(address);
            setIsConnected(true);
            setIsVerified(true);
            setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
            if (provider) {
              setProvider(provider);
            } else if (window.ethereum) {
              setProvider(new ethers.BrowserProvider(window.ethereum));
            }
          } else {
            // 새 계정이라면 서명 요청
            if (window.ethereum) {
              const ethProvider = new ethers.BrowserProvider(window.ethereum);
              try {
                await requestSignature(address, ethProvider);
              } catch (error) {
                console.error('계정 변경 후 서명 요청 중 오류:', error);
                handleDisconnect(); // 서명 거부 시 연결 취소
              }
            }
          }
        } else {
          handleDisconnect();
        }
      });
    }

    // 클릭 이벤트 리스너 추가
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // 컴포넌트 언마운트 시 이벤트 해제
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 서명 요청 함수
  const requestSignature = async (address: string, ethProvider: ethers.BrowserProvider) => {
    // 이미 서명 요청 중이면 중복 요청 방지
    if (isSigningMessage) {
      throw new Error('이미 서명 진행 중입니다.');
    }
    
    try {
      setIsSigningMessage(true);
      
      const message = generateSignMessage(address);
      const signer = await ethProvider.getSigner();
      const signature = await signer.signMessage(message);
      
      // 서명 검증
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // 서명한 주소와 지갑 주소가 일치하는지 확인
      if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
        setIsVerified(true);
        setAccount(address);
        setIsConnected(true);
        setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
        setProvider(ethProvider);
        
        localStorage.setItem(`signature_verified_${address}`, 'true');
        localStorage.setItem(`signature_${address}`, signature);
        console.log('서명 확인 완료');
        return true;
      } else {
        console.error('서명 주소가 일치하지 않습니다.');
        throw new Error('서명 주소가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('메시지 서명 중 오류:', error);
      // 서명 거부 또는 오류 발생 시 연결 초기화
      handleDisconnect();
      throw error; // 호출자가 오류를 처리할 수 있도록 다시 throw
    } finally {
      setIsSigningMessage(false);
    }
  };

  // 지갑 연결 함수
  const handleConnect = async () => {
    if (isSigningMessage) return; // 이미 서명 중이면 중복 호출 방지
    
    if (window.ethereum) {
      try {
        setIsSigningMessage(true);
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send('eth_requestAccounts', []);
        
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // 서명 상태 확인
          const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
          if (verifiedStatus === 'true') {
            // 이미 서명된 지갑이라면 바로 연결
            setAccount(address);
            setIsConnected(true);
            setIsVerified(true);
            setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
            setProvider(ethProvider);
          } else {
            // 새 연결이라면 바로 서명 요청
            await requestSignature(address, ethProvider);
          }
        }
      } catch (error) {
        console.error('지갑 연결 중 오류:', error);
        // 오류 발생 시 연결 취소 - 이미 requestSignature에서 handleDisconnect 호출됨
      } finally {
        setIsSigningMessage(false);
      }
    } else {
      alert(t('Please install MetaMask or other Web3 wallet'));
    }
  };

  // 지갑 연결 해제 함수
  const handleDisconnect = () => {
    if (account) {
      localStorage.removeItem(`signature_verified_${account}`);
      localStorage.removeItem(`signature_${account}`);
    }
    
    setAccount(null);
    setIsConnected(false);
    setDisplayAddress('');
    setProvider(null);
    setShowDropdown(false);
    setIsVerified(false);
    
    // 로컬 세션 정리
    localStorage.removeItem('walletConnected');
    
    // MetaMask에는 공식적인 연결 해제 API가 없지만, 연결 상태를 초기화합니다
    // 사용자에게 지갑 앱에서 로그아웃 하는 것을 안내할 수 있습니다
    if (window.ethereum && window.ethereum._metamask) {
      try {
        // 일부 지갑에서는 이 방법을 지원할 수 있습니다
        window.ethereum._metamask.isUnlocked().then(() => {
          console.log('사용자는 MetaMask에서 수동으로 로그아웃해야 할 수 있습니다');
        });
      } catch (e) {
        console.log('MetaMask 연결 해제 시도 중 오류:', e);
      }
    }
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="wallet-connect" ref={dropdownRef}>
      {isConnected ? (
        <div className="wallet-connected">
          <span 
            className="wallet-address" 
            onClick={toggleDropdown}
            onMouseEnter={() => setShowDropdown(true)}
          >
            {displayAddress}
            <span className="verified-badge">✓</span>
          </span>
          <div className="dropdown-connector"></div>
          {showDropdown && (
            <div 
              className="dropdown-menu"
              style={{ display: 'block' }}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button onClick={handleViewProfile} className="dropdown-item">
                {t('Profile')}
              </button>
              <button onClick={handleDisconnect} className="dropdown-item disconnect">
                {t('Disconnect')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button onClick={handleConnect} className="connect-button" disabled={isSigningMessage}>
          {isSigningMessage ? t('Signing...') : t('Connect Wallet')}
        </button>
      )}
    </div>
  );
};

export default WalletConnect; 