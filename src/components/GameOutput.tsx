import React, { useEffect, useRef, useContext } from "react";
import "./GameOutput.css";
import Options from "./Options";
import LoadingOverlay from "./LoadingOverlay";
import { MoralAlignment } from '../types/story';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../AppContext';
import { saveOrUpdateStory } from '../helpers/indexedDB';

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string;
}

interface GameOutputProps {
  output: string[];
  genre: string;
  turnCount: number;
  isLoading: boolean;
  options: { [key: string]: { text: string; risk: string } };
  isFinal: boolean;
  handleOptionsClick: (option: Option) => void;
  outcomes?: string[]; // 각 선택에 대한 결과 (성공/실패/부분 성공)
}

const GameOutput: React.FC<GameOutputProps> = ({
  output,
  genre,
  turnCount,
  isLoading,
  options,
  isFinal,
  handleOptionsClick,
  outcomes = []
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { state } = useContext(AppContext);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [output, isLoading]);

  // 결과 텍스트 및 클래스 가져오기
  const getOutcomeInfo = (index: number) => {
    // 실제 결과가 없는 경우 기본값 반환
    if (!outcomes || !outcomes[Math.floor(index/2)]) {
      return { text: '', className: '' };
    }
    
    const outcome = outcomes[Math.floor(index/2)];
    let text = '';
    let className = '';
    
    switch (outcome) {
      case 'success':
        text = t('성공');
        className = 'outcome-success';
        break;
      case 'partial':
        text = t('부분 성공');
        className = 'outcome-partial';
        break;
      case 'failure':
        text = t('실패');
        className = 'outcome-failure';
        break;
      default:
        text = '';
        className = '';
    }
    
    return { text, className };
  };

  // Normalize options to ensure alignment is present
  const normalizedOptions = Object.entries(options).reduce((acc, [key, option]) => {
    // 원본 옵션 객체에서 traitAlignment 필드를 보존합니다
    const normalizedOption = {
      ...option,
      alignment: (option as any).alignment || 'neutral' as MoralAlignment,
      traitAlignment: (option as any).traitAlignment || '' // 기존 값을 보존
    };
    console.log(`GameOutput normalizing option ${key}, traitAlignment:`, (option as any).traitAlignment);
    acc[key] = normalizedOption;
    return acc;
  }, {} as { [key: string]: Option });

  // 수동 저장 함수
  const handleSaveGame = () => {
    try {
      saveOrUpdateStory(state);
      alert(t('게임이 저장되었습니다!'));
    } catch (error) {
      console.error("Error saving game:", error);
      alert(t('저장 중 오류가 발생했습니다.'));
    }
  };

  return (
    <div className="game-output component-container">
      <div className="game-output-info">
        <p>Genre: {genre}</p>
        <p>Turns: {turnCount}</p>
      </div>
      <div className="game-output-content" ref={contentRef}>
        {output.map((text, index) => (
          <div key={index}>
            {/* 짝수 인덱스는 사용자 선택(항상 첫 번째 문장은 스토리이므로 인덱스 1부터 시작하는 짝수가 선택) */}
            {index > 0 && index % 2 === 1 ? (
              <p className="user-choice">
                ▶ {text}
                {index > 1 && getOutcomeInfo(index).text && (
                  <span className={`outcome-indicator ${getOutcomeInfo(index).className}`}>
                    {getOutcomeInfo(index).text}
                  </span>
                )}
              </p>
            ) : (
              <p>{text}</p>
            )}
            {index === output.length - 1 &&
              !isLoading &&
              !isFinal && (
                <Options options={normalizedOptions} handleClick={handleOptionsClick} />
              )}
          </div>
        ))}
      </div>
      <div className="game-output-actions">
        <button className="save-button" onClick={handleSaveGame}>
          {t('게임 저장')}
        </button>
      </div>
      <LoadingOverlay show={isLoading} />
    </div>
  );
};

export default GameOutput;
