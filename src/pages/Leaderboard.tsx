import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { supabase } from '../utils/supabaseClient';
import './Leaderboard.css';

interface LeaderboardEntry {
  wallet_address: string;
  score: number;
  ending_type: string;
  character_name: string;
  created_at: string;
  genre: string;
  turn_count: number;
}

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 장르 텍스트 축약 함수
  const truncateGenre = (genre: string) => {
    if (!genre || genre === 'Unknown') return 'Unknown';
    if (genre.length <= 12) return genre;
    
    return `${genre.substring(0, 6)}...${genre.substring(genre.length - 3)}`;
  };

  // 엔딩 타입을 영어로 표시하는 함수
  const getEnglishEndingType = (endingType: string) => {
    // 한글 엔딩 타입을 영어로 변환
    const endingMap: {[key: string]: string} = {
      '영웅적 승리': 'Heroic Victory',
      '피로스의 승리': 'Pyrrhic Victory',
      '안티히어로의 승리': 'Antihero Triumph',
      '비극적 몰락': 'Tragic Downfall',
      '씁쓸한 결말': 'Bittersweet Resolution',
      '달콤쓸쓸한 해결': 'Bittersweet Resolution'
    };
    
    return endingMap[endingType] || endingType;
  };

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
        const formattedData = data.map((entry: any) => {
          return {
            wallet_address: entry.wallet_address,
            score: entry.score || 0,
            ending_type: entry.ending_type || 'Unknown',
            character_name: entry.character_name || 'Unknown',
            created_at: entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'Unknown',
            genre: entry.genre || 'Unknown',
            turn_count: entry.turn_count || 0
          };
        });
        
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
                <th>{t('Character')}</th>
                <th>{t('Genre')}</th>
                <th>{t('Score')}</th>
                <th>{t('Turns')}</th>
                <th>{t('Ending')}</th>
                <th>{t('Date')}</th>
              </tr>
            </thead>
            <tbody>
              {topScores.map((entry, index) => (
                <tr key={entry.wallet_address} className={index < 3 ? `top-${index + 1}` : ''}>
                  <td className="rank-cell">{index + 1}</td>
                  <td className="character-cell">{entry.character_name}</td>
                  <td className="genre-cell" title={entry.genre}>{truncateGenre(entry.genre)}</td>
                  <td className="score-cell">{entry.score}</td>
                  <td className="turns-cell">{entry.turn_count}</td>
                  <td className="ending-cell">{getEnglishEndingType(entry.ending_type)}</td>
                  <td className="date-cell">{entry.created_at}</td>
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