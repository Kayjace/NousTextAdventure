import { MoralAlignment } from '../types/story';

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string;
}

const filterOptionsNew = (options: { [key: string]: Option }): { [key: string]: Option } => {
  console.log("filterOptionsNew received options:", JSON.stringify(options, null, 2));
  
  const filteredOptions: { [key: string]: Option } = {};
  
  // 다양성 확인을 위한 카운터
  let riskCounts = { low: 0, medium: 0, high: 0 };
  let alignmentCounts = { moral: 0, immoral: 0, neutral: 0 };
  
  // 먼저 각 옵션을 정규화하고 카운트
  const normalizedOptions = Object.entries(options).map(([key, option]) => {
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
      // 위험도 정규화 - 한글/영어 둘 다 처리
      let normalizedRisk = option.risk.toLowerCase();
      
      // 한글 위험도 처리 - 더 다양한 표현 추가
      if (normalizedRisk.includes('높음') || normalizedRisk.includes('높은') || 
          normalizedRisk.includes('리스크 높음') || normalizedRisk.includes('위험 높음') ||
          normalizedRisk.includes('상당한') || normalizedRisk.includes('큰 위험')) {
        normalizedRisk = 'high';
      } else if (normalizedRisk.includes('중간') || normalizedRisk.includes('보통') || 
                normalizedRisk.includes('리스크 중간') || normalizedRisk.includes('위험 중간') || 
                normalizedRisk.includes('적당한')) {
        normalizedRisk = 'medium';
      } else if (normalizedRisk.includes('낮음') || normalizedRisk.includes('낮은') || 
                normalizedRisk.includes('리스크 낮음') || normalizedRisk.includes('위험 낮음') || 
                normalizedRisk.includes('적은') || normalizedRisk.includes('안전한')) {
        normalizedRisk = 'low';
      } 
      // 영어 위험도 검사
      else if (normalizedRisk.includes('high')) {
        normalizedRisk = 'high';
      } else if (normalizedRisk.includes('medium')) {
        normalizedRisk = 'medium';
      } else if (normalizedRisk.includes('low')) {
        normalizedRisk = 'low';
      } else {
        normalizedRisk = 'medium'; // 기본값
      }
      
      // 도덕성 정규화 - 한글/영어 둘 다 처리
      let normalizedAlignment = (option.alignment || 'neutral').toLowerCase();
      
      // 한글 도덕성 처리 - 더 다양한 표현 추가
      if (normalizedAlignment.includes('선한') || normalizedAlignment.includes('도덕적') || 
          normalizedAlignment.includes('선함') || normalizedAlignment.includes('윤리적') || 
          normalizedAlignment.includes('착한')) {
        normalizedAlignment = 'moral';
      } else if (normalizedAlignment.includes('악한') || normalizedAlignment.includes('비도덕적') || 
                normalizedAlignment.includes('악함') || normalizedAlignment.includes('비윤리적') || 
                normalizedAlignment.includes('나쁜')) {
        normalizedAlignment = 'immoral';
      } else if (normalizedAlignment.includes('중립') || normalizedAlignment.includes('중간') || 
                normalizedAlignment.includes('보통') || normalizedAlignment.includes('중도적')) {
        normalizedAlignment = 'neutral';
      } 
      // 영어 도덕성 검사
      else if (normalizedAlignment.includes('moral') || normalizedAlignment.includes('good')) {
        normalizedAlignment = 'moral';
      } else if (normalizedAlignment.includes('immoral') || normalizedAlignment.includes('evil')) {
        normalizedAlignment = 'immoral';
      } else if (normalizedAlignment.includes('neutral')) {
        normalizedAlignment = 'neutral';
      } else {
        normalizedAlignment = 'neutral'; // 기본값
      }
      
      // 카운트 증가
      riskCounts[normalizedRisk as keyof typeof riskCounts]++;
      alignmentCounts[normalizedAlignment as keyof typeof alignmentCounts]++;
      
      return {
        key,
        option: {
          text: option.text,
          risk: normalizedRisk as 'low' | 'medium' | 'high',
          alignment: normalizedAlignment as MoralAlignment,
          traitAlignment: option.traitAlignment || ''
        }
      };
    }
    return null;
  }).filter(item => item !== null) as { key: string, option: Option }[];
  
  // 모든 옵션이 같은 위험도나 도덕성을 가지고 있는지 확인
  const allSameRisk = Object.values(riskCounts).filter(count => count > 0).length === 1;
  const allSameAlignment = Object.values(alignmentCounts).filter(count => count > 0).length === 1;
  
  // 옵션이 3개 이상이고 모두 같은 위험도나 도덕성을 가지고 있다면 다양화
  if (normalizedOptions.length >= 3) {
    if (allSameRisk) {
      // 옵션이 모두 같은 위험도를 가지고 있다면 다양화
      const riskLevels = ['low', 'medium', 'high'];
      normalizedOptions.forEach((item, index) => {
        if (item) {
          // 첫 번째 옵션은 low, 두 번째는 medium, 세 번째는 high로 설정
          item.option.risk = riskLevels[index % 3] as 'low' | 'medium' | 'high';
        }
      });
    }
    
    if (allSameAlignment) {
      // 옵션이 모두 같은 도덕성을 가지고 있다면 다양화
      const alignmentTypes = ['moral', 'immoral', 'neutral'];
      normalizedOptions.forEach((item, index) => {
        if (item) {
          // 첫 번째 옵션은 moral, 두 번째는 immoral, 세 번째는 neutral로 설정
          item.option.alignment = alignmentTypes[index % 3] as MoralAlignment;
        }
      });
    }
  }
  
  // 결과를 필터링된 옵션에 저장
  normalizedOptions.forEach(item => {
    if (item) {
      console.log(`Processing option ${item.key}, traitAlignment:`, item.option.traitAlignment);
      filteredOptions[item.key] = item.option;
    }
  });
  
  console.log("filterOptionsNew returning options:", JSON.stringify(filteredOptions, null, 2));
  return filteredOptions;
};

export default filterOptionsNew;