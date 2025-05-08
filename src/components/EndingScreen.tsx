import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // i18n hook import
import { useNavigate } from "react-router-dom"; // React Router 훅 추가
import "./EndingScreen.css";
import { AppContext } from "../AppContext";
import { supabase, getAuthenticatedClient } from "../utils/supabaseClient";
import { deleteStoryFromDB, fetchStoriesFromDB } from "../helpers/indexedDB";

interface EndingScreenProps {
  characterImage: string;
  output: string[];
  wrapUpParagraph: string;
  bigMoment: string;
  frequentActivity: string;
  characterTraitHighlight: string;
  themeExploration: string;
}

const EndingScreen: React.FC<EndingScreenProps> = ({
  characterImage,
  output,
  wrapUpParagraph,
  bigMoment,
  frequentActivity,
  characterTraitHighlight,
  themeExploration,
}) => {
  const { state, setState } = useContext(AppContext);
  const navigate = useNavigate(); // 내비게이션 훅 사용
  const { 
    playerStats, 
    overallScore, 
    scoreBreakdown,
    endingType,
    chosenCharacter
  } = state;
  const { t } = useTranslation(); // Get translation function
  
  // Game result saving state
  const [resultSaved, setResultSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  
  // 컴포넌트가 마운트될 때 z-index 문제 해결을 위한 effect
  useEffect(() => {
    // 내비게이션 버튼이 작동하도록 z-index 관련 문제 해결
    document.body.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // 저장 버튼 클릭 핸들러
  const handleSaveResult = async () => {
    // 이미 저장되었으면 중복 저장 방지
    if (resultSaved) return;
    
    // Get current wallet address
    const walletAddress = localStorage.getItem('current_wallet_address');
    if (!walletAddress) {
      setSaveError(t('No wallet address found.'));
      return;
    }
    
    // Get authentication token
    const authToken = localStorage.getItem(`auth_token_${walletAddress}`);
    if (!authToken) {
      setSaveError(t('Authentication token not found.'));
      return;
    }
    
    try {
      // 중복 저장 확인을 위해 Supabase에서 이미 저장된 결과가 있는지 확인
      const authClient = getAuthenticatedClient(walletAddress, authToken);
      const { data: existingResults } = await authClient
        .from('game_results')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .eq('character_name', chosenCharacter)
        .eq('ending_type', endingType);
      
      // 이미 저장된 결과가 있고, 점수와 엔딩 타입이 동일하면 중복으로 간주
      if (existingResults && existingResults.length > 0) {
        const isDuplicate = existingResults.some((result: any) => 
          result.score === overallScore && 
          result.ending_type === endingType &&
          Math.abs(new Date(result.created_at).getTime() - Date.now()) < 86400000 // 24시간 이내 저장된 결과
        );
        
        if (isDuplicate) {
          console.log('Duplicate score detected, not saving again');
          setResultSaved(true);
          setSaveError(t('This result has already been saved recently.'));
          return;
        }
      }
      
      // Create detailed game statistics
      const detailedStats = {
        scoreBreakdown,
        playerStats,
        turnCount: state.turnCount,
        moralChoices: state.moralChoices,
        successfulChoices: state.successfulChoices
      };
      
      // Save game result to Supabase using authenticated client
      const { error } = await authClient
        .from('game_results')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          score: overallScore,
          ending_type: endingType,
          character_name: chosenCharacter,
          detailed_stats: detailedStats
        });
        
      if (error) {
        console.error('Error saving game result:', error);
        setSaveError(error.message);
        return;
      }
      
      console.log('Game result successfully saved!');
      setResultSaved(true);
      
      // 저장 성공 후 로컬 저장 데이터 삭제
      try {
        // 현재 지갑 주소로 저장된 모든 스토리를 가져옴
        const stories = await fetchStoriesFromDB();
        
        // 현재 캐릭터와 장르가 일치하는 스토리 찾기 (중복 데이터 모두 삭제)
        const duplicateStories = stories.filter(s => 
          s.chosenCharacter === chosenCharacter && 
          s.isFinal === true && 
          s.endingType === endingType
        );
        
        if (duplicateStories.length > 0) {
          console.log(`Found ${duplicateStories.length} duplicate stories to delete`);
          
          // 모든 중복 스토리 삭제
          for (const story of duplicateStories) {
            if (story.id) {
              await deleteStoryFromDB(story.id);
              console.log(`Deleted duplicate story ID: ${story.id}`);
            }
          }
          
          setIsDeleted(true);
          console.log('Local story data deleted after successful save');
        }
      } catch (deleteError) {
        console.error('Error deleting local story data:', deleteError);
      }
      
    } catch (error) {
      console.error('Exception occurred while saving game result:', error);
      setSaveError(t('An unexpected error occurred.'));
    }
  };

  // Different background styles based on ending type
  const getEndingBackgroundStyle = () => {
    switch(endingType?.toLowerCase()) {
      case "heroic victory":
        return "ending-heroic";
      case "pyrrhic victory":
        return "ending-pyrrhic";
      case "antihero triumph":
        return "ending-antihero";
      case "tragic downfall":
        return "ending-tragic";
      case "bittersweet resolution":
        return "ending-bittersweet";
      default:
        return "";
    }
  };

  return (
    <div className={`ending-screen ${getEndingBackgroundStyle()}`}>
      <div className="ending-container">
        <div className="ending-header">
          <h1>{t('Adventure Complete')}</h1>
          <h2 className="ending-type">{t(endingType)}</h2>
        </div>
        
        <div className="ending-content">
          <div className="character-section">
            <img src={characterImage} alt={chosenCharacter} className="character-image" />
            <h3>{chosenCharacter}{t("'s Journey")}</h3>
          </div>
          
          <div className="story-wrap">
            <h3>{t('Your Epic Tale')}</h3>
            <p>{wrapUpParagraph}</p>
          </div>
          
          <div className="highlights">
            <div className="highlight-item">
              <h4>{t('Most Epic Moment')}</h4>
              <p>{bigMoment}</p>
            </div>
            <div className="highlight-item">
              <h4>{t('Signature Move')}</h4>
              <p>{frequentActivity}</p>
            </div>
            <div className="highlight-item">
              <h4>{t('Character Trait')}</h4>
              <p>{characterTraitHighlight}</p>
            </div>
            <div className="highlight-item">
              <h4>{t('Theme Song')}</h4>
              <p>{themeExploration}</p>
            </div>
          </div>
          
          <div className="score-section">
            <div className="overall-score">
              <h3>{t('Adventure Score')}</h3>
              <div className="score-circle">
                <span>{overallScore}</span>
              </div>
            </div>
            
            <div className="score-breakdown">
              <h3>{t('Performance')}</h3>
              <div className="score-bars">
                <div className="score-bar">
                  <span>{t('Decision Quality')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${scoreBreakdown?.decisions || 0}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown?.decisions || 0}</span>
                </div>
                <div className="score-bar">
                  <span>{t('Character Consistency')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${scoreBreakdown?.consistency || 0}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown?.consistency || 0}</span>
                </div>
                <div className="score-bar">
                  <span>{t('Creative Problem Solving')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${scoreBreakdown?.creativity || 0}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown?.creativity || 0}</span>
                </div>
                <div className="score-bar">
                  <span>{t('Moral Compass')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${Math.abs(scoreBreakdown?.morality || 0)}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown?.morality || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="player-stats">
              <h3>{t('Adventure Stats')}</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">{t('Moral Score:')}</span>
                  <span className="stat-value">{playerStats?.moralScore || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Risk Score:')}</span>
                  <span className="stat-value">{playerStats?.riskScore || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Trait Consistency:')}</span>
                  <span className="stat-value">{playerStats?.traitConsistency || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Success Rate:')}</span>
                  <span className="stat-value">{playerStats?.successRate || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ending-actions">
          {!resultSaved && (
            <button className="save-result-btn" onClick={handleSaveResult}>
              {t('Save Adventure Results')}
            </button>
          )}
          
          {/* Result saving status display */}
          {resultSaved && !saveError && (
            <div className="result-saved-status success">
              <span>✓</span> {t('Result saved successfully')}
              {isDeleted && <span> {t('and local data deleted')}</span>}
            </div>
          )}
          {saveError && (
            <div className={`result-saved-status ${saveError.includes('already been saved') ? 'warning' : 'error'}`}>
              <span>{saveError.includes('already been saved') ? '⚠' : '✗'}</span> {saveError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EndingScreen;
