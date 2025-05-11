import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Profile.css';
import { supabase, getAuthenticatedClient } from '../utils/supabaseClient';
import crownIcon from '../assets/crown-icon.png';

interface ErrorState {
  type: 'connection' | 'auth' | 'data' | 'unknown' | null;
  message: string;
}

interface GameResult {
  score: number;
  created_at: string;
  detailed_stats?: {
    turnCount?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [savedUsername, setSavedUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [gameStats, setGameStats] = useState({
    totalGames: 0,
    totalScore: 0,
    totalTurns: 0,
    highScore: 0
  });
  const [twitterFollowed, setTwitterFollowed] = useState(false);
  const [showFollowConfirm, setShowFollowConfirm] = useState(false);
  const [followProcessing, setFollowProcessing] = useState(false);
  const twitterAccount = "ape_research";
  const [usernameStatus, setUsernameStatus] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await ethProvider.listAccounts();
          if (accounts.length > 0) {
            const address = accounts[0].address;
            setAccount(address);
            setIsConnected(true);
            await loadUserData(address);
          }
        } catch (error) {
          setError({ type: 'auth', message: 'An error occurred while checking wallet connection.' });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  const loadUserData = async (address: string) => {
    try {
      setError(null);
      
      // 로컬 스토리지에서 인증 토큰 가져오기
      const authToken = localStorage.getItem(`auth_token_${address.toLowerCase()}`);
      
      // 인증된 클라이언트 사용 또는 기본 클라이언트로 폴백
      const client = authToken 
        ? getAuthenticatedClient(address.toLowerCase(), authToken) 
        : supabase;
      
      // 인증된 클라이언트로 사용자 정보 요청
      const { data, error } = await client
        .from('users')
        .select('username, twitter_followed')
        .eq('wallet_address', address.toLowerCase())
        .single();
        
      // 게임 결과도 인증된 클라이언트로 요청
      const { data: gameResults } = await client
        .from('game_results')
        .select('score, detailed_stats')
        .eq('wallet_address', address.toLowerCase());
        
      if (gameResults) {
        setGameStats({
          totalGames: gameResults.length,
          totalScore: gameResults.reduce((sum: number, r: GameResult) => sum + (r.score || 0), 0),
          totalTurns: gameResults.reduce((sum: number, r: GameResult) => sum + (r.detailed_stats?.turnCount || 0), 0),
          highScore: Math.max(...gameResults.map((r: GameResult) => r.score || 0), 0)
        });
      }
      
      if (data) {
        setUsername(data.username || '');
        setSavedUsername(data.username || '');
        setTwitterFollowed(data.twitter_followed || false);
      }
      
      if (error) {
        console.error('Failed to fetch user information:', error);
        setError({ type: 'data', message: 'Failed to fetch user information.' });
      }
    } catch (e) {
      console.error('An error occurred while fetching data:', e);
      setError({ type: 'unknown', message: 'An error occurred while fetching data.' });
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameStatus('');
  };

  const saveUsername = async () => {
    if (!username || !account) return;
    if (username === savedUsername) return;
    try {
      setUsernameStatus(t('Saving...'));
      
      // 로컬 스토리지에서 인증 토큰 가져오기
      const authToken = localStorage.getItem(`auth_token_${account.toLowerCase()}`);
      
      // 인증된 클라이언트 사용 또는 기본 클라이언트로 폴백
      const client = authToken 
        ? getAuthenticatedClient(account.toLowerCase(), authToken) 
        : supabase;
      
      // 인증된 클라이언트로 사용자 정보 업데이트
      const { error } = await client
        .from('users')
        .update({ username })
        .eq('wallet_address', account.toLowerCase());
        
      if (error) {
        console.error('Failed to update username:', error);
        setUsernameStatus(t('Save failed'));
      } else {
        setSavedUsername(username);
        setUsernameStatus(t('Saved!'));
      }
    } catch (e) {
      console.error('An error occurred while saving username:', e);
      setUsernameStatus(t('Save failed'));
    }
  };

  const handleTwitterFollow = () => {
    if (!account) return;
    window.open(`https://twitter.com/intent/follow?screen_name=${twitterAccount}`, '_blank');
    setShowFollowConfirm(true);
  };

  const confirmTwitterFollow = async () => {
    if (!account) return;
    setFollowProcessing(true);
    
    // 로컬 스토리지에서 인증 토큰 가져오기
    const authToken = localStorage.getItem(`auth_token_${account.toLowerCase()}`);
    
    // 인증된 클라이언트 사용 또는 기본 클라이언트로 폴백
    const client = authToken 
      ? getAuthenticatedClient(account.toLowerCase(), authToken) 
      : supabase;
    
    // 인증된 클라이언트로 트위터 팔로우 상태 업데이트
    const { error } = await client
      .from('users')
      .update({ twitter_followed: true })
      .eq('wallet_address', account.toLowerCase());
      
    if (error) {
      console.error('Failed to update Twitter follow status:', error);
    } else {
      setTwitterFollowed(true);
      setShowFollowConfirm(false);
    }
    setFollowProcessing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Address copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    if (address.length <= 12) return address;
    const start = address.substring(0, 6);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="profile-container">
          <h1>{t('Loading profile...')}</h1>
        </div>
      </Layout>
    );
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="profile-container">
          <div className="profile-not-connected">
            <h2>{t('Wallet Not Connected')}</h2>
            <p>{t('Please connect your wallet from the homepage to view your profile.')}</p>
            <button className="return-home-button" onClick={() => navigate('/')}>{t('Return to Home')}</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        {error && (
          <div className="profile-error-message">
            <p><strong>{t('Error')}:</strong> {error.message}</p>
            <button className="error-action-button" onClick={() => navigate('/')}>{t('Return to Home')}</button>
          </div>
        )}
        <div className="profile-section user-info">
          <h3>{t('Account & Benefits')}</h3>
          <div className="user-info-list">
            <div className="info-item">
              <span className="label">{t('Wallet Address')}:</span>
              <div className="wallet-display">
                <span className="truncated-address">
                  {formatAddress(account)}
                </span>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(account || '')}
                >
                  {t('Copy')}
                </button>
              </div>
            </div>
            <div className="info-item username-row">
              <span className="label">{t('Username')}:</span>
              <div className="username-col">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onKeyDown={e => { if (e.key === 'Enter') saveUsername(); }}
                  placeholder={t('Enter username')}
                  className="username-input"
                />
                <button 
                  className="save-username-btn"
                  onClick={saveUsername}
                  disabled={username === savedUsername || !username}
                >
                  {t('Save')}
                </button>
              </div>
            </div>
            <div className="info-item follow-row">
              {twitterFollowed ? (
                <div className="royal-supporter-badge">
                  <img src={crownIcon} alt="Royal Supporter" className="badge-icon" />
                  <span className="badge-title">{t('Royal Supporter')}</span>
                  <div className="badge-tooltip">
                    {t('Royal Supporter Badge - Reward Multiplier: x1.5 (You will have x1.5 multiplier from future reward distribution and *secret* access to future WL raffles from my community projects)')}
                  </div>
                </div>
              ) : (
                <>
                  <span className="follow-text">{t('Follow for get Royal supporter badge')}</span>
                  {showFollowConfirm ? (
                    <button
                      className="twitter-follow-btn"
                      onClick={confirmTwitterFollow}
                      disabled={followProcessing}
                    >
                      {followProcessing ? t('Processing...') : t('Confirm')}
                    </button>
                  ) : (
                    <button
                      className="twitter-follow-btn"
                      onClick={handleTwitterFollow}
                    >
                      {t('Follow')}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="profile-section game-stats">
          <h3>{t('Game Statistics')}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">{t('Total Games')}</span>
              <span className="stat-value">{gameStats.totalGames}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('Total Score')}</span>
              <span className="stat-value">{gameStats.totalScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('Total Turns')}</span>
              <span className="stat-value">{gameStats.totalTurns}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('High Score')}</span>
              <span className="stat-value">{gameStats.highScore}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 