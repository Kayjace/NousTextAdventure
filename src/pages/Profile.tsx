import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Profile.css';
import { supabase, getAuthenticatedClient, getUserGameResults } from '../utils/supabaseClient';
import { updateUserProfile as updateProfile, checkAuthenticationStatus } from '../utils/walletAuth';
import crownIcon from '../assets/crown-icon.png'; // 왕관 아이콘 이미지 필요

// 오류 타입 정의
interface ErrorState {
  type: 'connection' | 'auth' | 'data' | 'unknown' | null;
  message: string;
}

// 게임 결과 타입 정의
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
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    highScore: 0,
    totalTurns: 0,
    gameHistory: [] as { date: string; score: number; turns: number }[],
  });
  
  // 트위터 팔로우 관련 상태
  const [twitterFollowed, setTwitterFollowed] = useState(false);
  const [showFollowConfirm, setShowFollowConfirm] = useState(false);
  const [followProcessing, setFollowProcessing] = useState(false);
  
  // 트위터 계정 설정
  const twitterAccount = "ape_research"; // 팔로우할 트위터 계정명

  const [usernameStatus, setUsernameStatus] = useState<string>('');

  // Check wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      // 로컬 스토리지에서 인증 상태 확인
      const { isAuthenticated, walletAddress } = checkAuthenticationStatus();
      
      if (isAuthenticated && walletAddress) {
        // 인증된 상태이면 상태 업데이트
        setAccount(walletAddress);
        setIsConnected(true);
        setIsVerified(true);
        
        // 사용자 데이터와 게임 결과 로드
        await loadUserData(walletAddress);
        await loadGameResults(walletAddress);
        setIsLoading(false);
        return; // 인증 정보를 찾았으므로 여기서 종료
      }
      
      // 로컬 스토리지에 인증 정보가 없으면 MetaMask 연결 확인
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await ethProvider.listAccounts();
          
          if (accounts.length > 0) {
            const address = accounts[0].address;
            setAccount(address);
            setIsConnected(true);
            
            // Check signature verification status
            const verifiedStatus = localStorage.getItem(`signature_verified_${address}`);
            if (verifiedStatus === 'true') {
              setIsVerified(true);
              
              // Load user data from Supabase
              await loadUserData(address);
              // Load game results from Supabase
              await loadGameResults(address);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setError({
            type: 'auth',
            message: '지갑 연결 확인 중 오류가 발생했습니다.'
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);
  
  // 페이지를 다시 방문할 때마다 데이터 새로 로드
  useEffect(() => {
    if (account && isVerified) {
      // 이미 연결되어 있고 확인된 상태에서 데이터 다시 로드
      loadUserData(account);
      loadGameResults(account);
    }
  }, [window.location.pathname, account, isVerified]);

  // Fetch user information from Supabase
  const loadUserData = async (address: string) => {
    try {
      // Clear previous errors
      setError(null);
      
      // JWT 토큰 가져오기 (RLS 정책에 필요)
      const authToken = localStorage.getItem(`auth_token_${address}`);
      if (!authToken) {
        console.error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        setError({
          type: 'auth',
          message: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.'
        });
        return;
      }
      
      // Query user information
      const { data, error } = await supabase
        .from('users')
        .select('username, twitter_followed')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (error) {
        console.error('Error loading user information:', error);
        
        // Check for specific error types and provide helpful messages
        if (error.code === 'PGRST116') {
          // No rows returned - This is normal for new users
          console.log('새 사용자 - 계정 정보가 아직 없습니다.');
        } else if (error.code === '406') {
          // Not Acceptable - likely issue with conditional request
          setError({
            type: 'data',
            message: '데이터 형식 오류: Supabase 테이블 구조가 예상과 다릅니다.'
          });
        } else if (error.code === '401' || error.code === '403') {
          setError({
            type: 'auth',
            message: '인증 오류: RLS 정책에 따른 접근 권한이 없습니다.'
          });
        } else {
          setError({
            type: 'unknown',
            message: `데이터 조회 오류 (${error.code}): ${error.message}`
          });
        }
        return;
      }
      
      if (data) {
        if (data.username) {
          setUsername(data.username);
          setSavedUsername(data.username);
        }
        
        // 트위터 팔로우 상태 설정
        setTwitterFollowed(data.twitter_followed || false);
      }
    } catch (error) {
      console.error('Error querying user data:', error);
      setError({
        type: 'unknown',
        message: '사용자 데이터 조회 중 예기치 않은 오류가 발생했습니다.'
      });
    }
  };
  
  // 트위터 팔로우 처리 함수
  const handleTwitterFollow = () => {
    if (!account) return;
    
    // 트위터 인텐트 URL로 새 창 열기
    window.open(`https://twitter.com/intent/follow?screen_name=${twitterAccount}`, '_blank');
    // 확인 버튼 표시
    setShowFollowConfirm(true);
  };
  
  // 트위터 팔로우 확인 처리 함수
  const confirmTwitterFollow = async () => {
    if (!account) return;
    
    try {
      setFollowProcessing(true);
      
      const authToken = localStorage.getItem(`auth_token_${account}`);
      if (!authToken) {
        setError({
          type: 'auth',
          message: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.'
        });
        setFollowProcessing(false);
        return;
      }

      // 인증된 클라이언트 생성
      const authClient = getAuthenticatedClient(account, authToken);
      
      // 트위터 팔로우 상태 업데이트
      const { error } = await authClient
        .from('users')
        .update({ twitter_followed: true })
        .eq('wallet_address', account.toLowerCase())
        .select()
        .single();
      
      if (error) {
        console.error('트위터 팔로우 상태 업데이트 실패:', error);
        setError({
          type: 'data',
          message: '트위터 팔로우 상태 업데이트 중 오류가 발생했습니다.'
        });
        setFollowProcessing(false);
        return;
      }
      
      setTwitterFollowed(true);
      setShowFollowConfirm(false);
      
      // 성공 메시지
      alert(t('Royal Supporter 뱃지를 획득했습니다! 이제 보상 배율 1.5배가 적용됩니다.'));
      
    } catch (error) {
      console.error('트위터 팔로우 확인 중 오류:', error);
      setError({
        type: 'unknown',
        message: '트위터 팔로우 확인 중 예기치 않은 오류가 발생했습니다.'
      });
    } finally {
      setFollowProcessing(false);
    }
  };

  // 트위터 팔로우 상태 로드
  useEffect(() => {
    const loadTwitterFollowStatus = async () => {
      if (!account) return;
      
      try {
        // 먼저 로컬 스토리지에서 확인
        const localStatus = localStorage.getItem(`twitter_followed_${account.toLowerCase()}`);
        if (localStatus === 'true') {
          setTwitterFollowed(true);
          return;
        }
        
        // DB에서 상태 확인
        const { data, error } = await supabase
          .from('users')
          .select('twitter_followed')
          .eq('wallet_address', account.toLowerCase())
          .single();
          
        if (error) {
          console.error('트위터 팔로우 상태 로드 실패:', error);
          return;
        }
        
        if (data?.twitter_followed) {
          setTwitterFollowed(true);
          localStorage.setItem(`twitter_followed_${account.toLowerCase()}`, 'true');
        }
      } catch (error) {
        console.error('트위터 팔로우 상태 확인 중 오류:', error);
      }
    };
    
    loadTwitterFollowStatus();
  }, [account]);

  // Fetch game results from Supabase
  const loadGameResults = async (address: string) => {
    try {
      // JWT 토큰 가져오기 (RLS 정책에 필요)
      const authToken = localStorage.getItem(`auth_token_${address}`);
      if (!authToken) {
        console.error('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }
      
      // 인증된 클라이언트로 게임 결과 조회
      const { data, error } = await getUserGameResults(address, authToken);
      
      if (error) {
        console.error('Error loading game results:', error);
        setError({
          type: 'data',
          message: '게임 결과 로딩 오류: ' + (typeof error === 'object' ? JSON.stringify(error) : error)
        });
        return;
      }
      
      if (data && data.length > 0) {
        // 게임 결과 타입 캐스팅
        const gameResults = data as GameResult[];
        
        // Calculate game statistics
        const gamesPlayed = gameResults.length;
        
        // 안전한 숫자 변환 함수
        const safeNumber = (value: any): number => {
          if (value === null || value === undefined) return 0;
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        };
        
        // 안전하게 점수 합계 계산
        const totalScore = gameResults.reduce((sum: number, game: GameResult) => sum + safeNumber(game.score), 0);
        
        // 유효한 점수만 필터링하여 최고 점수 계산
        const validScores = gameResults.map((game: GameResult) => safeNumber(game.score)).filter((score: number) => score > 0);
        const highScore = validScores.length > 0 ? Math.max(...validScores) : 0;
        
        // 총 턴수 계산 (detailed_stats가 없거나 turnCount가 없는 경우 처리)
        const totalTurns = gameResults.reduce((sum: number, game: GameResult) => {
          const turnCount = game.detailed_stats && typeof game.detailed_stats === 'object' 
            ? safeNumber(game.detailed_stats.turnCount) 
            : 0;
          return sum + turnCount;
        }, 0);
        
        // Transform game history (latest 10)
        const gameHistory = gameResults.slice(0, 10).map((game: GameResult) => ({
          date: new Date(game.created_at).toLocaleDateString(),
          score: safeNumber(game.score),
          turns: game.detailed_stats && typeof game.detailed_stats === 'object'
            ? safeNumber(game.detailed_stats.turnCount)
            : 0
        }));
        
        setGameStats({
          gamesPlayed,
          totalScore,
          highScore,
          totalTurns,
          gameHistory
        });
      }
    } catch (error) {
      console.error('Error querying game results:', error);
      setError({
        type: 'unknown',
        message: '게임 결과 조회 중 예기치 않은 오류가 발생했습니다.'
      });
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
      setError(null);
      
      const authToken = localStorage.getItem(`auth_token_${account}`);
      if (!authToken) {
        setError({ type: 'auth', message: '인증 토큰이 만료되었습니다. 다시 로그인해주세요.' });
        setUsernameStatus(t('Auth error'));
        return;
      }

      // 인증된 클라이언트 생성
      const authClient = getAuthenticatedClient(account, authToken);
      
      // 사용자 정보 업데이트
      const { error } = await authClient
        .from('users')
        .update({ username: username })
        .eq('wallet_address', account.toLowerCase())
        .select()
        .single();
      
      if (error) {
        console.error('사용자명 업데이트 실패:', error);
        setError({ type: 'data', message: '사용자명 업데이트 오류가 발생했습니다.' });
        setUsernameStatus(t('Save failed'));
        return;
      }
      
      setSavedUsername(username);
      setUsernameStatus(t('Saved!'));
      
    } catch (error) {
      console.error('사용자명 저장 중 오류:', error);
      setError({ type: 'unknown', message: '사용자명 저장 중 오류가 발생했습니다.' });
      setUsernameStatus(t('Save failed'));
    }
  };

  const goToHome = () => {
    navigate('/');
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

  if (!isConnected || !isVerified) {
    return (
      <Layout>
        <div className="profile-container">
          <div className="profile-not-connected">
            <h2>{t('Wallet Not Connected')}</h2>
            <p>{t('Please connect your wallet from the homepage to view your profile.')}</p>
            <button className="return-home-button" onClick={goToHome}>
              {t('Return to Home')}
            </button>
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
            <button className="error-action-button" onClick={goToHome}>
              {t('Return to Home')}
            </button>
          </div>
        )}
        
        {/* 통합된 사용자 정보 및 트위터 팔로우 섹션 */}
        <div className="profile-section user-info">
          <h3>{t('Account & Benefits')}</h3>
          
          <div className="user-info-list">
            <div className="info-item">
              <span className="label">{t('Wallet Address')}:</span>
              <span className="value">{account}</span>
            </div>
            <div className="info-item">
              <span className="label">{t('Username')}:</span>
              <div className="username-col">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={saveUsername}
                  onKeyDown={e => { if (e.key === 'Enter') saveUsername(); }}
                  placeholder={t('Enter username')}
                  className="username-input"
                />
                <div className="username-meta">
                  <span className="current-username">{t('Current')}: {savedUsername || t('Not set')}</span>
                  {usernameStatus && <span className="username-status">{usernameStatus}</span>}
                </div>
              </div>
            </div>
            <div className="info-item follow-row">
              {twitterFollowed ? (
                <div className="royal-supporter-badge right-align">
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
        
        {/* 게임 통계 섹션 */}
        <div className="profile-section game-stats">
          <h3>{t('Game Statistics')}</h3>
          
          <div className="stats-grid two-per-row">
            <div className="stat-item">
              <span className="stat-label">{t('Games Played')}:</span>
              <span className="stat-value">{gameStats.gamesPlayed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('Total Score')}:</span>
              <span className="stat-value">{gameStats.totalScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('High Score')}:</span>
              <span className="stat-value">{gameStats.highScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('Total Turns')}:</span>
              <span className="stat-value">{gameStats.totalTurns}</span>
            </div>
          </div>
          
          <h4>{t('Recent Games')}</h4>
          {gameStats.gameHistory.length > 0 ? (
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
          ) : (
            <p className="no-history">{t('No game history yet.')}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 