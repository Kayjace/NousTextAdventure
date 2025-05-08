import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
      translation: {
        // 기존 번역들...
        'Enter your Nous Research API key:': 'Enter your Nous Research API key:',
        'Nous API key': 'Nous API key',
        'Submit': 'Submit',
        'This is all run in the browser so the API key is private; it is used to generate your own story.': 'This is all run in the browser so the API key is private; it is used to generate your own story.',
        'Get your API key from': 'Get your API key from',
        'Nous Research Portal': 'Nous Research Portal',

        // CharacterImageSelection
        'Choose me': 'Choose me',
        
        // CharacterInfo
        'Hide Details': 'Hide Details',
        'Show Details': 'Show Details',
        'Traits': 'Traits',
        'Character Bio': 'Character Bio',
        
        // CharacterSelection
        'Select a character:': 'Select a character:',
        'Enter first and last name or generate a random name.': 'Enter first and last name or generate a random name.',
        'First Name': 'First Name',
        'Last Name': 'Last Name',
        'Random': 'Random',
        
        // EndingScreen
        'Adventure Complete': 'Adventure Complete',
        'Your Epic Tale': 'Your Epic Tale',
        'Most Epic Moment': 'Most Epic Moment',
        'Signature Move': 'Signature Move',
        'Character Trait': 'Character Trait',
        'Theme Song': 'Theme Song',
        'Adventure Score': 'Adventure Score',
        'Performance': 'Performance',
        'Decision Quality': 'Decision Quality',
        'Character Consistency': 'Character Consistency',
        'Creative Problem Solving': 'Creative Problem Solving',
        'Moral Compass': 'Moral Compass',
        'Adventure Stats': 'Adventure Stats',
        'Moral Score:': 'Moral Score:',
        'Risk Score:': 'Risk Score:',
        'Trait Consistency:': 'Trait Consistency:',
        'Creativity:': 'Creativity:',
        'Success Rate:': 'Success Rate:',
        'Return to Home': 'Return to Home',
        
        // GameLoadOrCreate
        'Start New Game': 'Start New Game',
        
        // GameOutput
        'Genre:': 'Genre:',
        'Turns:': 'Turns:',
        
        // GenreSelection
        'Select a genre:': 'Select a genre:',
        'Enter custom genre': 'Enter custom genre',
        'Submit Genre': 'Submit Genre',
        
        // MyStories
        'No saved stories available': 'No saved stories available',
        'Story deleted!': 'Story deleted!',
        'Story loaded!': 'Story loaded!',
        'Delete': 'Delete',
        'Load': 'Load',
        'Enter your choice' : 'Enter your choice'

      }
    },
    kr: {
      translation: {
        // 기존 번역들...
        'Enter your Nous Research API key:': 'Nous Research API 키를 입력하세요:',
        'Nous API key': 'Nous API 키',
        'Submit': '입력',
        'This is all run in the browser so the API key is private; it is used to generate your own story.': '브라우저 기반 앱이므로 API 키는 외부에 공개되지 않습니다. API키는 당신만의 이야기를 생성하는 데 사용됩니다.',
        'Get your API key from': 'API 키는 다음에서 얻을 수 있습니다',
        'Nous Research Portal': 'Nous Research 포털',

        // CharacterImageSelection
        'Choose me': '선택',
        
        // CharacterInfo
        'Hide Details': '정보 숨기기',
        'Show Details': '캐릭터 정보',
        'Traits': '특성',
        'Character Bio': '일대기',
        
        // CharacterSelection
        'Select a character:': '캐릭터 선택:',
        'Enter first and last name or generate a random name.': '이름(되도록 영문명) 입력하거나 랜덤으로 생성하기.',
        'First Name': '이름',
        'Last Name': '성',
        'Random': '랜덤',
        
        // EndingScreen
        'Adventure Complete': '모험 완료',
        'Your Epic Tale': '당신의 서사시',
        'Most Epic Moment': '가장 멋진 순간',
        'Signature Move': '시그니처 무브',
        'Character Trait': '캐릭터 특성',
        'Theme Song': '테마 곡',
        'Adventure Score': '모험 점수',
        'Performance': '성과',
        'Decision Quality': '결정의 질',
        'Character Consistency': '캐릭터의 일관성',
        'Creative Problem Solving': '창의적 문제 해결치',
        'Moral Compass': '도덕적 경향',
        'Adventure Stats': '모험 통계',
        'Moral Score:': '도덕성 점수:',
        'Risk Score:': '위험감수 점수:',
        'Trait Consistency:': '특성의 일관성:',
        'Creativity:': '창의성:',
        'Success Rate:': '성공률:',
        'Return to Home': '홈으로 돌아가기',
        
        // GameLoadOrCreate
        'Start New Game': '새 게임 시작',
        
        // GameOutput
        'Genre:': '장르:',
        'Turns:': '턴:',
        
        // GenreSelection
        'Select a genre:': '장르 선택:',
        'Enter custom genre': '커스텀 장르 입력',
        'Submit Genre': '장르 제출',
        
        // MyStories
        'No saved stories available': '저장된 이야기가 없습니다',
        'Story deleted!': '이야기가 삭제되었습니다!',
        'Story loaded!': '이야기가 로드되었습니다!',
        'Delete': '삭제',
        'Load': '불러오기',
        'Enter your choice' : '선택하세요'
      }
    }
  };

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // 기본 언어
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
export {}