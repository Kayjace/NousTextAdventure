// src/components/Options.tsx
import React from "react";
import "./Options.css";
import { MoralAlignment } from '../types/story';
import { useTranslation } from 'react-i18next';

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string;
}

interface OptionsProps {
  options: { [key: string]: Option };
  handleClick: (option: Option) => void;
}

const Options: React.FC<OptionsProps> = ({ options, handleClick }) => {
  const { t } = useTranslation();

  // 디버깅을 위한 코드
  React.useEffect(() => {
    console.log("Options component received options:", JSON.stringify(options, null, 2));
  }, [options]);

  // 정렬에 대한 색상 매핑
  const getAlignmentColor = (alignment: MoralAlignment): string => {
    switch (alignment) {
      case 'moral':
        return 'var(--moral-color, #4aff4a)';
      case 'immoral':
        return 'var(--immoral-color, #ff4a4a)';
      default:
        return 'var(--neutral-color, #4affff)';
    }
  };

  // 위험 수준에 대한 색상 매핑
  const getRiskColor = (risk: string): string => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'var(--high-risk, #ff6b6b)';
      case 'medium':
        return 'var(--medium-risk, #ffd166)';
      case 'low':
        return 'var(--low-risk, #06d6a0)';
      default:
        return 'var(--neutral-color, #4affff)';
    }
  };

  return (
    <div className="options">
      {Object.entries(options).map(([optionKey, option]) => {
        console.log(`Option ${optionKey} traitAlignment:`, option.traitAlignment);
        return (
          <button
            onClick={() => handleClick(option)}
            key={optionKey}
            className={`option-button ${option.alignment}-alignment ${option.risk}-risk ${option.traitAlignment ? 'trait-aligned' : ''}`}
          >
            <div className="option-content">
              <div className="option-row">
                <span className="option-text">{option.text.replace(/\s*[\(（][^)）]*[\)）]/g, '')}</span>
                <div className="inline-badges">
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(option.risk) }}
                  >
                    {t(`RISK: ${option.risk}`)}
                  </span>
                  <span 
                    className="moral-badge"
                    style={{ backgroundColor: getAlignmentColor(option.alignment) }}
                  >
                    {t(`MORAL: ${option.alignment}`)}
                  </span>
                  {option.traitAlignment && option.traitAlignment.trim() !== '' && (
                    <span className="trait-badge">
                      {t('TRAIT')}: {option.traitAlignment}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default Options;
