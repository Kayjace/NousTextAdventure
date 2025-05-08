import chatGPTRequest from './chatGPTRequest';
import i18n from './i18n'; // i18n 인스턴스 import

const fetchGameWorld = async (chosenGenre: string, chosenCharacter: string, apiKey: string, provider: string) => {
  const maxWords = 80;
  const language = i18n.language;
  let gameWorldPrompt = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    gameWorldPrompt = `
한국어로 응답해주세요.
선택한 장르 "${chosenGenre}"와 선택한 캐릭터 이름 "${chosenCharacter}"를 기반으로, 텍스트 기반 어드벤처 게임을 위한 상세하고 몰입감 있는 게임 세계 설명을 제공해주세요. 이 설명은 배경, 전반적인 분위기, 게임 세계의 독특한 특징이나 위치 등을 포함해야 합니다.
미래 프롬프트에서 풍부하고 매력적인 게임 환경을 만들기 위해 사용할 수 있는, 최대 ${maxWords}단어 이내의 잘 구성된 문장 시리즈로 설명을 작성해주세요.
`;
  } else {
    gameWorldPrompt = `
Based on the chosen genre "${chosenGenre}" and the chosen characters name "${chosenCharacter}", please provide a detailed and immersive description of the game world for a text-based adventure game. The description should cover aspects such as the setting, the general atmosphere, and any unique features or locations in the game world.
Please format the description as a series of well-structured sentences in no more than ${maxWords} words that can be used in future prompts to create a rich and engaging game environment.
`;
  }
  
  const fetchedGameWorld = await chatGPTRequest(gameWorldPrompt, apiKey, provider);
  const gameWorld = fetchedGameWorld[0];
  return gameWorld;
};

export default fetchGameWorld;
