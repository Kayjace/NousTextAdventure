import { MoralAlignment } from '../types/story';

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string;
}

const filterOptionsNew = (options: { [key: string]: Option }): { [key: string]: Option } => {
  const filteredOptions: { [key: string]: Option } = {};
  
  Object.entries(options).forEach(([key, option]) => {
    // 기본 검증
    if (
      option &&
      typeof option === 'object' &&
      'text' in option &&
      typeof option.text === 'string' &&
      option.text.trim() !== '' &&
      'risk' in option &&
      typeof option.risk === 'string'
    ) {
      // 위험도 정규화
      let normalizedRisk = option.risk.toLowerCase();
      if (!['low', 'medium', 'high'].includes(normalizedRisk)) {
        normalizedRisk = 'medium';
      }
      
      // 도덕성 정규화
      let normalizedAlignment = (option.alignment || 'neutral').toLowerCase();
      if (!['moral', 'immoral', 'neutral'].includes(normalizedAlignment)) {
        normalizedAlignment = 'neutral';
      }
      
      // 정규화된 옵션 저장
      filteredOptions[key] = {
        text: option.text,
        risk: normalizedRisk as 'low' | 'medium' | 'high',
        alignment: normalizedAlignment as MoralAlignment,
        traitAlignment: option.traitAlignment
      };
    }
  });
  
  return filteredOptions;
};

export default filterOptionsNew;