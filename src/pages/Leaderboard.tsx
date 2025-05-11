import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { supabase } from '../utils/supabaseClient';
import './Leaderboard.css';

interface LeaderboardEntry {
  wallet_address: string;
  username?: string;
  score: number;
  ending_type: string;
  character_name: string;
  created_at: string;
}

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // leaderboard 테이블에서 직접 데이터 조회
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('Error fetching leaderboard data:', error);
          setError(`Failed to load leaderboard data: ${error.message}`);
          return;
        }
        
        if (!data || data.length === 0) {
          console.log('No leaderboard data found');
          setTopScores([]);
          return;
        }
        
        // Transform data to display format
        const formattedData = data.map((entry: any) => ({
          wallet_address: entry.wallet_address,
          username: entry.character_name || 'Unknown',
          score: entry.score || 0,
          ending_type: 'Completed', // leaderboard 테이블에는 ending_type이 없으므로 기본값 설정
          character_name: entry.character_name || 'Unknown',
          created_at: entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Unknown'
        }));
        
        console.log('Formatted leaderboard data:', formattedData);
        setTopScores(formattedData);
      } catch (error) {
        console.error('Unexpected error loading leaderboard:', error);
        setError('An unexpected error occurred while loading the leaderboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  return (
    <Layout>
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">{t('Leaderboard')}</h2>
        
        {isLoading ? (
          <div className="leaderboard-loading">{t('Loading...')}</div>
        ) : error ? (
          <div className="leaderboard-error">{error}</div>
        ) : topScores.length === 0 ? (
          <div className="leaderboard-empty">{t('No scores yet. Be the first to play!')}</div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>{t('Rank')}</th>
                <th>{t('Player')}</th>
                <th>{t('Character')}</th>
                <th>{t('Score')}</th>
                <th>{t('Ending')}</th>
                <th>{t('Date')}</th>
              </tr>
            </thead>
            <tbody>
              {topScores.map((entry, index) => (
                <tr key={entry.wallet_address} className={index < 3 ? `top-${index + 1}` : ''}>
                  <td>{index + 1}</td>
                  <td>{entry.username}</td>
                  <td>{entry.character_name}</td>
                  <td>{entry.score}</td>
                  <td>{entry.ending_type}</td>
                  <td>{entry.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard; 