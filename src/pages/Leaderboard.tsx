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

// Supabase에서 반환되는 데이터 타입 정의
interface GameResultWithUser {
  wallet_address: string;
  score: number;
  ending_type: string;
  character_name: string;
  created_at: string;
  users: { username: string }[] | null;
  [key: string]: any;
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
        
        // Join game_results with users to get usernames
        const { data, error } = await supabase
          .from('game_results')
          .select(`
            score,
            ending_type,
            character_name,
            created_at,
            wallet_address,
            users (username)
          `)
          .order('score', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('Error fetching leaderboard data:', error);
          setError('Failed to load leaderboard data');
          return;
        }
        
        // Transform data to display format
        const formattedData = data.map((entry: GameResultWithUser) => {
          // Supabase 조인 쿼리에서 users가 배열로 반환됨
          const username = entry.users && Array.isArray(entry.users) && entry.users.length > 0 
            ? entry.users[0].username
            : '';
            
          return {
            wallet_address: entry.wallet_address,
            username: username,
            score: entry.score,
            ending_type: entry.ending_type,
            character_name: entry.character_name,
            created_at: new Date(entry.created_at).toLocaleDateString()
          };
        });
        
        setTopScores(formattedData);
      } catch (error) {
        console.error('Unexpected error loading leaderboard:', error);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  // Helper function to format wallet address
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Layout>
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h2>{t('Leaderboard')}</h2>
          <p>{t('Top adventure scores from all players')}</p>
        </div>
        
        {isLoading ? (
          <div className="leaderboard-loading">
            <p>{t('Loading leaderboard data...')}</p>
          </div>
        ) : error ? (
          <div className="leaderboard-error">
            <p>{error}</p>
          </div>
        ) : (
          <div className="leaderboard-content">
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
                {topScores.map((entry: LeaderboardEntry, index: number) => (
                  <tr key={index} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td className="rank-cell">{index + 1}</td>
                    <td>
                      {entry.username || formatAddress(entry.wallet_address)}
                    </td>
                    <td>{entry.character_name}</td>
                    <td className="score-cell">{entry.score}</td>
                    <td>{entry.ending_type}</td>
                    <td>{entry.created_at}</td>
                  </tr>
                ))}
                
                {topScores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="no-entries">
                      {t('No adventures completed yet. Be the first to set a high score!')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard; 