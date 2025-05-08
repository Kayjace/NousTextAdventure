import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLeaderboard } from '../utils/supabaseClient';
import './Leaderboard.css';

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  created_at: string;
}

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // RLS 정책에 따라 누구나 리더보드 데이터를 볼 수 있음
        const { data, error } = await getLeaderboard(100);
        
        if (error) {
          console.error('리더보드 데이터 로드 실패:', error);
          setError('리더보드 데이터를 불러오는 데 실패했습니다.');
          return;
        }
        
        setLeaderboardData(data || []);
      } catch (err) {
        console.error('리더보드 로드 중 오류 발생:', err);
        setError('리더보드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">{t('Leaderboard')}</h2>
      
      {isLoading ? (
        <div className="leaderboard-loading">{t('Loading...')}</div>
      ) : error ? (
        <div className="leaderboard-error">{error}</div>
      ) : leaderboardData.length === 0 ? (
        <div className="leaderboard-empty">{t('No scores yet. Be the first to play!')}</div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>{t('Rank')}</th>
              <th>{t('Player')}</th>
              <th>{t('Score')}</th>
              <th>{t('Date')}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr key={entry.id} className={index < 3 ? `top-${index + 1}` : ''}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                <td>{formatDate(entry.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard; 