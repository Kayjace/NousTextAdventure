import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
      translation: {
        // 
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
        'New Adventure': 'New Adventure',
        'Continue Adventure': 'Continue Adventure',
        'Start a fresh journey with new characters, worlds, and stories.': 'Start a fresh journey with new characters, worlds, and stories.',
        'Resume your previous adventures and continue your journey.': 'Resume your previous adventures and continue your journey.',
        'View Saved Games': 'View Saved Games',
        'Your Saved Adventures': 'Your Saved Adventures',
        'Showing stories for wallet:': 'Showing stories for wallet:',
        'No saved stories available for this wallet': 'No saved stories available for this wallet',
        
        // GameOutput
        'Genre:': 'Genre:',
        'Turns:': 'Turns:',
        '성공': 'SUCCESS',
        '부분 성공': 'PARTIAL',
        '실패': 'FAILURE',
        '게임 저장': 'Save Game',
        '게임이 저장되었습니다!': 'Game saved successfully!',
        '저장 중 오류가 발생했습니다.': 'Error occurred while saving.',
        '이전에 저장된 게임이 있습니다. 계속하시겠습니까?': 'You have a previously saved game. Would you like to continue?',
        
        // Options Metadata
        'RISK: high': 'RISK: High',
        'RISK: medium': 'RISK: Medium',
        'RISK: low': 'RISK: Low',
        'MORAL: moral': 'MORAL: Good',
        'MORAL: immoral': 'MORAL: Evil',
        'MORAL: neutral': 'MORAL: Neutral',
        'TRAIT:': 'TRAIT:',
        
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
        'Enter your choice' : 'Enter your choice',
        'Loading...': 'Loading...',
        'Refresh': 'Refresh',
        'Loading stories...': 'Loading stories...',
        'Failed to load stories': 'Failed to load stories',
        'Saved': 'Saved',
        
        // Profile - Twitter follow
        'Account & Benefits': 'Account & Benefits',
        'Wallet Address': 'Wallet Address',
        'Username': 'Username',
        'Enter username': 'Enter username',
        'Save': 'Save',
        'Your Profile': 'Your Profile',
        'Error': 'Error',
        'Wallet Not Connected': 'Wallet Not Connected',
        'Please connect your wallet from the homepage to view your profile.': 'Please connect your wallet from the homepage to view your profile.',
        'Game Statistics': 'Game Statistics',
        'Games Played': 'Games Played',
        'Total Score': 'Total Score',
        'High Score': 'High Score',
        'Total Turns': 'Total Turns',
        'Recent Games': 'Recent Games',
        'Date': 'Date',
        'Score': 'Score',
        'Turns': 'Turns',
        'No game history yet.': 'No game history yet.',
        'Follow for Royal Supporter Badge': 'Follow for Royal Supporter Badge',
        'Did you follow?': 'Did you follow?',
        'Confirm': 'Confirm',
        'Processing...': 'Processing...',
        'Follow': 'Follow',
        'Royal Supporter': 'Royal Supporter',
        'Royal Supporter Badge - Reward Multiplier: x1.5 (You will have x1.5 multiplier from future reward distribution and *secret* access to future WL raffles from my community projects)': 'Royal Supporter Badge - Reward Multiplier: x1.5 (You will have x1.5 multiplier from future reward distribution and *secret* access to future WL raffles from my community projects)',
        'You have earned the Royal Supporter badge! You now have a 1.5x reward multiplier.': 'You have earned the Royal Supporter badge! You now have a 1.5x reward multiplier.',
        
        // Ending Types
        'Heroic Victory': 'Heroic Victory',
        'Pyrrhic Victory': 'Pyrrhic Victory',
        'Antihero Triumph': 'Antihero Triumph',
        'Tragic Downfall': 'Tragic Downfall',
        'Bittersweet Resolution': 'Bittersweet Resolution'
      }
    },
    kr: {
      translation: {
        //
        'Enter your Nous Research API key:': 'Nous Research API 키를 입력하세요:',
        'Nous API key': 'Nous API 키',
        'Submit': '입력',
        'This is all run in the browser so the API key is private;' : '브라우저 기반 앱이므로 API 키는 로컬PC 외부에 공개되지 않습니다.',
        'it is used to generate your own story.': 'API키는 당신만의 이야기를 생성하는 데 사용됩니다.',
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
        'Enter first and last name or generate a random name.': '이름 입력하거나 랜덤으로 생성하기.',
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
        'Risk Score:': '리스크 점수:',
        'Trait Consistency:': '특성의 일관성:',
        'Creativity:': '창의성:',
        'Success Rate:': '성공률:',
        'Return to Home': '홈으로 돌아가기',
        
        // GameLoadOrCreate
        'Start New Game': '새 게임 시작',
        'New Adventure': '새로운 모험',
        'Continue Adventure': '모험 계속하기',
        'Start a fresh journey with new characters, worlds, and stories.': '새로운 캐릭터, 세계, 스토리로 새 여정을 시작하세요.',
        'Resume your previous adventures and continue your journey.': '이전 모험을 다시 시작하고 여정을 계속하세요.',
        'View Saved Games': '저장된 게임 보기',
        'Your Saved Adventures': '저장된 모험',
        'Showing stories for wallet:': '지갑에 저장된 스토리:',
        'No saved stories available for this wallet': '이 지갑에 저장된 스토리가 없습니다',
        
        // GameOutput
        'Genre:': '장르:',
        'Turns:': '턴:',
        '성공': '성공',
        '부분 성공': '부분 성공',
        '실패': '실패',
        '게임 저장': '게임 저장',
        '게임이 저장되었습니다!': '게임이 저장되었습니다!',
        '저장 중 오류가 발생했습니다.': '저장 중 오류가 발생했습니다.',
        '이전에 저장된 게임이 있습니다. 계속하시겠습니까?': '이전에 저장된 게임이 있습니다. 계속하시겠습니까?',
        
        // Options Metadata
        'RISK: high': '위험도: 높음',
        'RISK: medium': '위험도: 중간',
        'RISK: low': '위험도: 낮음',
        'MORAL: moral': '도덕성: 선한',
        'MORAL: immoral': '도덕성: 악한',
        'MORAL: neutral': '도덕성: 중립',
        'TRAIT:': '특성:',
        
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
        'Enter your choice' : '선택하세요',
        'Loading...': '로딩 중...',
        'Refresh': '새로고침',
        'Loading stories...': '스토리를 불러오는 중...',
        'Failed to load stories': '스토리를 불러오는 데 실패했습니다',
        'Saved': '저장',
        
        // Profile - Twitter follow
        'Account & Benefits': '계정 및 혜택',
        'Wallet Address': '지갑 주소',
        'Username': '사용자명',
        'Enter username': '사용자명 입력',
        'Save': '저장',
        'Your Profile': '내 프로필',
        'Error': '오류',
        'Wallet Not Connected': '지갑이 연결되지 않음',
        'Please connect your wallet from the homepage to view your profile.': '프로필을 보려면 홈페이지에서 지갑을 연결하세요.',
        'Game Statistics': '게임 통계',
        'Games Played': '게임 횟수',
        'Total Score': '총 점수',
        'High Score': '최고 점수',
        'Total Turns': '총 턴 수',
        'Recent Games': '최근 게임',
        'Date': '날짜',
        'Score': '점수',
        'Turns': '턴 수',
        'No game history yet.': '아직 게임 기록이 없습니다.',
        'Follow for Royal Supporter Badge': '로열 서포터 뱃지 획득하기',
        'Did you follow?': '팔로우하셨나요?',
        'Confirm': '확인',
        'Processing...': '처리 중...',
        'Follow': '팔로우',
        'Royal Supporter': '로열 서포터',
        'Royal Supporter Badge - Reward Multiplier: x1.5 (You will have x1.5 multiplier from future reward distribution and *secret* access to future WL raffles from my community projects)': '로열 서포터 뱃지 - 보상 배율: x1.5 (향후 보상 분배에서 1.5배 배율과 커뮤니티 프로젝트의 향후 WL 래플에 *비밀* 접근 권한을 갖게 됩니다)',
        'You have earned the Royal Supporter badge! You now have a 1.5x reward multiplier.': '로열 서포터 뱃지를 획득하셨습니다! 이제 1.5배 보상 배율이 적용됩니다.',
        
        // Ending Types
        'Heroic Victory': '영웅적 승리',
        'Pyrrhic Victory': '피로스의 승리',
        'Antihero Triumph': '안티히어로의 승리',
        'Tragic Downfall': '비극적 몰락',
        'Bittersweet Resolution': '씁쓸한 결말'
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