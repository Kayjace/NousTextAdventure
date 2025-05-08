import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Profile.css';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [savedUsername, setSavedUsername] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    highScore: 0,
    gameHistory: [] as { date: string; score: number; turns: number }[],
  });

  // 지갑 연결 확인
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
            
            // 서명 상태 확인
            const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
            if (verifiedStatus === 'true') {
              setIsVerified(true);
            }
            
            // 사용자 데이터 로드
            const storedUsername = localStorage.getItem(`username_${address}`);
            if (storedUsername) {
              setUsername(storedUsername);
              setSavedUsername(storedUsername);
            }

            // 게임 통계 로드 (나중에 DB로 대체)
            const storedStats = localStorage.getItem(`stats_${address}`);
            if (storedStats) {
              setGameStats(JSON.parse(storedStats));
            } else {
              // 더미 데이터 세팅 (테스트용 - 실제 구현 시 제거 필요)
              const dummyStats = {
                gamesPlayed: 5,
                totalScore: 850,
                highScore: 220,
                gameHistory: [
                  { date: '2023-05-01', score: 150, turns: 15 },
                  { date: '2023-05-03', score: 220, turns: 18 },
                  { date: '2023-05-07', score: 180, turns: 14 },
                  { date: '2023-05-12', score: 120, turns: 10 },
                  { date: '2023-05-15', score: 180, turns: 16 }
                ]
              };
              localStorage.setItem(`stats_${address}`, JSON.stringify(dummyStats));
              setGameStats(dummyStats);
            }
          }
        } catch (error) {
          console.error('지갑 연결 확인 중 오류:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const saveUsername = () => {
    if (username && account) {
      localStorage.setItem(`username_${account}`, username);
      setSavedUsername(username);
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="profile-not-connected">
          <h2>{t('Connect your wallet to view your profile')}</h2>
          <button onClick={goToHome} className="return-home-button">
            {t('Return to Home')}
          </button>
        </div>
      </Layout>
    );
  }

  if (!isVerified) {
    return (
      <Layout>
        <div className="profile-not-connected">
          <h2>{t('Please verify your wallet to access your profile')}</h2>
          <p>{t('Click on your wallet address and select "Verify Wallet" from the dropdown menu.')}</p>
          <button onClick={goToHome} className="return-home-button">
            {t('Return to Home')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="profile-container">
        <div className="profile-header">
          <h2>{t('Profile')}</h2>
        </div>

        <div className="profile-section user-info">
          <h3>{t('User Information')}</h3>
          <div className="wallet-info">
            <span className="label">{t('Wallet Address')}:</span>
            <span className="value">{account}</span>
          </div>

          <div className="username-editor">
            <label htmlFor="username">{t('Username')}:</label>
            <div className="username-input-group">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder={t('Enter username')}
              />
              <button onClick={saveUsername}>{t('Save')}</button>
            </div>
            {savedUsername && (
              <p className="current-username">
                {t('Current Username')}: <strong>{savedUsername}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="profile-section game-stats">
          <h3>{t('Game Statistics')}</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{gameStats.gamesPlayed}</div>
              <div className="stat-label">{t('Games Played')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{gameStats.totalScore}</div>
              <div className="stat-label">{t('Total Score')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{gameStats.highScore}</div>
              <div className="stat-label">{t('High Score')}</div>
            </div>
          </div>
        </div>

        {gameStats.gameHistory && gameStats.gameHistory.length > 0 && (
          <div className="profile-section game-history">
            <h3>{t('Game History')}</h3>
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{t('Date')}</th>
                    <th>{t('Score')}</th>
                    <th>{t('Turns')}</th>
                  </tr>
                </thead>
                <tbody>
                  {gameStats.gameHistory.map((game, index) => (
                    <tr key={index}>
                      <td>{game.date}</td>
                      <td>{game.score}</td>
                      <td>{game.turns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile; 