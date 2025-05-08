import React, { useContext } from "react";
import { useTranslation } from "react-i18next"; // i18n 훅 추가
import "./EndingScreen.css";
import { AppContext } from "../AppContext";

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
  const { 
    playerStats, 
    overallScore, 
    scoreBreakdown,
    endingType,
    chosenCharacter
  } = state;
  const { t } = useTranslation(); // 번역 함수 가져오기

  // Different background styles based on ending type
  const getEndingBackgroundStyle = () => {
    switch(endingType.toLowerCase()) {
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

  const handleReturnHome = () => {
    setState(prevState => ({
      ...prevState,
      gameState: "loadOrCreate"
    }));
  };

  return (
    <div className={`ending-screen ${getEndingBackgroundStyle()}`}>
      <div className="ending-container">
        <div className="ending-header">
          <h1>{t('Adventure Complete')}</h1>
          <h2 className="ending-type">{endingType}</h2>
        </div>
        
        <div className="ending-content">
          <div className="character-section">
            <img src={characterImage} alt={chosenCharacter} className="character-image" />
            <h3>{chosenCharacter}'s Journey</h3>
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
                    <div className="bar-fill" style={{ width: `${scoreBreakdown.decisions}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown.decisions}</span>
                </div>
                <div className="score-bar">
                  <span>{t('Character Consistency')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${scoreBreakdown.consistency}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown.consistency}</span>
                </div>
                <div className="score-bar">
                  <span>{t('Creative Problem Solving')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${scoreBreakdown.creativity}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown.creativity}</span>
                </div>
                <div className="score-bar">
                  <span>{t('Moral Compass')}</span>
                  <div className="bar-container">
                    <div className="bar-fill" style={{ width: `${Math.abs(scoreBreakdown.morality)}%` }}></div>
                  </div>
                  <span className="score-value">{scoreBreakdown.morality}</span>
                </div>
              </div>
            </div>
            
            <div className="player-stats">
              <h3>{t('Adventure Stats')}</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">{t('Moral Score:')}</span>
                  <span className="stat-value">{playerStats.moralScore}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Risk Score:')}</span>
                  <span className="stat-value">{playerStats.riskScore}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Trait Consistency:')}</span>
                  <span className="stat-value">{playerStats.traitConsistency}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Creativity:')}</span>
                  <span className="stat-value">{playerStats.creativity}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{t('Success Rate:')}</span>
                  <span className="stat-value">{playerStats.successRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ending-actions">
          <button className="return-home-btn" onClick={handleReturnHome}>
            {t('Return to Home')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndingScreen;
