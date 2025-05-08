import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import './WalletConnect.css';
import { supabase, authenticateWithWallet } from '../utils/supabaseClient';
import { getNonce, generateSignMessage, verifySignature, createAuthToken, clearAuthenticationData } from '../utils/walletAuth';

// Wallet connection component
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

  // Check wallet connection
  useEffect(() => {
    // 이벤트 리스너를 위한 flag
    let mounted = true;
    // 계정 변경 이벤트 한 번만 처리하도록 플래그 추가
    let isAccountChangeProcessing = false;
    
    // 이벤트 핸들러 정의
    const handleAccountsChanged = async (accounts: string[]) => {
      // 이미 처리 중인 경우 중복 실행 방지
      if (isAccountChangeProcessing || !mounted) return;
      
      try {
        isAccountChangeProcessing = true;
        console.log('계정 변경 감지:', accounts);
        
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // Check signature status when account changes
          const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
          if (verifiedStatus === 'true') {
            // If already signed, connect immediately
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
            // 새 계정에 대해 서명 요청 전 확인
            if (window.ethereum && !isSigningMessage) {
              const ethProvider = new ethers.BrowserProvider(window.ethereum);
              try {
                await requestSignature(address, ethProvider);
              } catch (error) {
                console.error('Error requesting signature after account change:', error);
                handleDisconnect(); // Cancel connection if signature is rejected
              }
            }
          }
        } else {
          handleDisconnect();
        }
      } finally {
        // 처리 완료 후 플래그 해제
        if (mounted) {
          isAccountChangeProcessing = false;
        }
      }
    };
    
    // 클릭 이벤트 핸들러
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    // 연결 상태 확인
    const checkConnection = async () => {
      // 현재 지갑 주소 확인
      const currentWalletAddress = localStorage.getItem('current_wallet_address');
      
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          
          // 먼저 로컬 스토리지에서 인증 상태 확인
          if (currentWalletAddress) {
            const verifiedStatus = localStorage.getItem(`signature_verified_${currentWalletAddress}`);
            const authToken = localStorage.getItem(`auth_token_${currentWalletAddress}`);
            
            if (verifiedStatus === 'true' && authToken) {
              // 로컬 스토리지에 인증 정보가 있으면 연결 상태 설정
              setAccount(currentWalletAddress);
              setIsConnected(true);
              setIsVerified(true);
              setDisplayAddress(`${currentWalletAddress.substring(0, 6)}...${currentWalletAddress.substring(currentWalletAddress.length - 4)}`);
              setProvider(ethProvider);
              console.log('Found authenticated wallet in localStorage:', currentWalletAddress);
              return; // 로컬 스토리지에서 인증 정보를 찾았으므로 여기서 종료
            }
          }
          
          // 로컬 스토리지에 인증 정보가 없으면 현재 연결된 계정 확인
          try {
            const accounts = await ethProvider.listAccounts();
            
            if (accounts.length > 0) {
              const address = accounts[0].address;
              
              // 이전에 연결된 지갑과 현재 지갑이 다른 경우 초기화
              if (currentWalletAddress && currentWalletAddress.toLowerCase() !== address.toLowerCase()) {
                console.log('지갑 주소가 변경되었습니다. 인증 상태를 초기화합니다.');
                handleDisconnect();
                return;
              }
              
              // Check signature verification status
              const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
              const authToken = localStorage.getItem(`auth_token_${address}`);
              
              if (verifiedStatus === 'true' && authToken) {
                // If wallet is already verified, set connection state
                setAccount(address);
                setIsConnected(true);
                setIsVerified(true);
                setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
                setProvider(ethProvider);
                console.log('Found previously verified wallet:', address);
              } else {
                // Wallet is connected but not verified - we won't request signature automatically
                console.log('Found connected wallet, but not verified. Waiting for user to click connect.');
              }
            }
          } catch (error) {
            console.log('No connection detected, waiting for user to connect');
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    // 비동기 초기화 함수
    const initialize = async () => {
      await checkConnection();
      
      // 이벤트 리스너 등록
      if (window.ethereum) {
        // 기존 리스너 제거
        window.ethereum.removeAllListeners?.('accountsChanged');
        
        // 새 리스너 등록
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
      
      document.addEventListener('mousedown', handleClickOutside);
    };
    
    // 초기화 실행
    initialize();

    // 클린업 함수
    return () => {
      mounted = false;
      
      // 이벤트 리스너 제거
      if (window.ethereum) {
        window.ethereum.removeAllListeners?.('accountsChanged');
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Request signature function
  const requestSignature = async (address: string, ethProvider: ethers.BrowserProvider) => {
    // Prevent duplicate signature requests
    if (isSigningMessage) {
      console.log('이미 서명 중입니다. 중복 요청을 무시합니다.');
      throw new Error('Signature process already in progress.');
    }
    
    try {
      setIsSigningMessage(true);
      console.log('서명 요청 시작:', address);
      
      // 1. 서버에서 논스 가져오기 (사용자가 없으면 자동 생성)
      const nonce = await getNonce(address);
      
      // 2. 서명 메시지 생성 (논스 포함)
      const message = generateSignMessage(address, nonce);
      
      // 3. 사용자에게 서명 요청
      const signer = await ethProvider.getSigner();
      const signature = await signer.signMessage(message);
      
      // 4. 서명 검증
      const isValid = verifySignature(message, signature, address);
      
      if (!isValid) {
        console.error('Signature verification failed');
        throw new Error('Signature verification failed');
      }
      
      // 5. JWT 토큰 생성 (RLS 정책에서 사용)
      const authToken = createAuthToken(address);
      
      // 6. 로컬 스토리지에 인증 정보 저장 (먼저 저장하여 다른 컴포넌트에서도 사용 가능하도록)
      localStorage.setItem('current_wallet_address', address);
      localStorage.setItem(`signature_verified_${address}`, 'true');
      localStorage.setItem(`signature_${address}`, signature);
      localStorage.setItem(`auth_token_${address}`, authToken);
      
      // 7. Supabase에 인증 요청
      const result = await authenticateWithWallet(address, authToken, message, signature);
      
      // 인증 결과 처리
      if ('error' in result && result.error) {
        console.error('Error authenticating with wallet:', result.error);
        throw new Error('Authentication failed. Please try again.');
      }
      
      // 9. 상태 업데이트
      setIsVerified(true);
      setAccount(address);
      setIsConnected(true);
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
      setProvider(ethProvider);
      
      console.log('Signature verification and authentication completed');
      
      return true;
    } catch (error) {
      console.error('Error during message signing:', error);
      // Reset connection on signature rejection or error
      handleDisconnect();
      throw error; // Re-throw for caller to handle
    } finally {
      setIsSigningMessage(false);
    }
  };

  // Wallet connect function
  const handleConnect = async () => {
    if (isSigningMessage) return; // Prevent duplicate calls if already signing
    
    if (window.ethereum) {
      try {
        setIsSigningMessage(true);
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethProvider.send('eth_requestAccounts', []);
        
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // Check signature status
          const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
          if (verifiedStatus === 'true') {
            // If already signed, connect immediately
            setAccount(address);
            setIsConnected(true);
            setIsVerified(true);
            setDisplayAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
            setProvider(ethProvider);
          } else {
            // For new connections, request signature immediately
            await requestSignature(address, ethProvider);
          }
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        // Error handling - handleDisconnect already called in requestSignature
      } finally {
        setIsSigningMessage(false);
      }
    } else {
      alert(t('Please install MetaMask or other Web3 wallet'));
    }
  };

  // Wallet disconnect function
  const handleDisconnect = () => {
    if (account) {
      // 인증 정보 초기화 함수 사용
      clearAuthenticationData(account);
    }
    
    setAccount(null);
    setIsConnected(false);
    setDisplayAddress('');
    setProvider(null);
    setShowDropdown(false);
    setIsVerified(false);
    
    // MetaMask doesn't have an official disconnect API, but we reset the connection state
    // User may need to be guided to log out from their wallet app
    if (window.ethereum && window.ethereum._metamask) {
      try {
        // Some wallets might support this method
        window.ethereum._metamask.isUnlocked().then(() => {
          console.log('User may need to manually logout from MetaMask');
        });
      } catch (e) {
        console.log('Error attempting to disconnect MetaMask:', e);
      }
    }
  };

  const handleViewProfile = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  // Toggle dropdown
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