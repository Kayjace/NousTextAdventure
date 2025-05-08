import chatGPTRequest from "../chatGPTRequest";
import dallERequest from "../dallE";
import processJson from "../utils/processJson";
import { useTranslation } from "react-i18next"; // i18n 훅 추가
import i18n from '../i18n';

interface CharacterData {
  characterQuirks: string[];
  characterGender: string;
  characterBio: string;
  characterFacialFeatures: string[];
}

const fetchCharacterTraitsAndBio = async (
  chosenGenre: string,
  chosenCharacter: string,
  chosenImage: string,
  apiKey: string,
  provider: string,
) => {
  const maxWords = 70;
  const language = i18n.language;

  // 언어에 따라 다른 프롬프트 생성
  let characterTraitsAndBioPrompt = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    characterTraitsAndBioPrompt = `
    한국어로 응답해주세요. 
    '${chosenGenre}' 장르와 주인공 '${chosenCharacter}'을(를) 기반으로 텍스트 어드벤처 게임을 위한 상세한 캐릭터 프로필을 작성하세요. 다음 요소를 포함하세요:
  
    1. 좋은 점과 나쁜 점이 섞인 다섯 가지 성격 특성. 모험적인 성격부터 평범한 성격까지 다양하게 고려하세요.
    2. 캐릭터의 성별(남성, 여성, 논바이너리).
    3. 캐릭터의 독특한 기술과 능력을 강조하는 짧은 소개글(최대 ${maxWords} 단어). 2-4개의 능력이나 기술을 포함하세요. 이 능력들은 장르에 따라 뛰어난 재능, 배운 기술, 초자연적 힘일 수 있습니다. 진부한 표현은 피하고, 장르에서 덜 사용되는 설명을 생각하세요. 특정 장소나 미래 계획은 언급하지 마세요.
    4. 눈 색깔, 머리 색깔, 피부 색깔 등 캐릭터 얼굴의 주요 시각적 특징 5가지.
  
    성별에 맞는 대명사를 소개글과 특성에 항상 사용하세요.
    다음 JSON 형식으로만 정보를 출력하세요.
  
    {
      "characterQuirks": ["특성1", "특성2", "특성3", "특성4", "특성5"],
      "characterGender": "성별",
      "characterBio": "상세한 소개글, 최대 ${maxWords} 단어",
      "characterFacialFeatures": ["시각적 특징1", "시각적 특징2", "시각적 특징3", "시각적 특징4", "시각적 특징5"]
    }
    `;
  } else {
    characterTraitsAndBioPrompt = `
    Construct a detailed character profile for a text-adventure game based on the genre '${chosenGenre}' and the main character '${chosenCharacter}'. Include these three components:

    1. Five personality traits that display a mix of good and bad qualities. Consider various personalities from adventurous to mundane.
    2. a gender for the character, male, female, or non-binary.
    3. A short bio (up to ${maxWords} words) emphasizing the character's unique skills and abilities. Incorporate 2-4 abilities or skills, which may be exceptional talents, learned skills, or supernatural powers, depending on the genre. Avoid clichés by thinking of less commonly used character descriptions in the genre. Don't mention specific locations or future plans.
    4. Key visual facial features of the characters face, such as eye color, hair color, skin color, or other distinguishing or interesting features.
    
    For the chosen gender please always use the correct pronouns in the bio and quirks.
    Please output the information in the following JSON format, never include any text or anything else than the JSON:
    
    {
      "characterQuirks": ["quirk-1", "quirk-2", "quirk-3", "quirk-4", "quirk-5"],
      "characterGender": "specified gender",
      "characterBio": "detailed biography, max words 150",
      "characterFacialFeatures": ["feature1", "feature2", "feature3", "feature4", "feature5"]
    }
    `;
  }

  const fetchedCharacterTraitsAndBio = await chatGPTRequest(
    characterTraitsAndBioPrompt,
    apiKey,
    provider
  );
  console.log("Raw response from chatGPTRequest:", fetchedCharacterTraitsAndBio);
  const characterData: CharacterData = processJson<CharacterData>(
    fetchedCharacterTraitsAndBio[0]
  );

  return {
    characterTraits: characterData.characterQuirks,
    characterBio: characterData.characterBio,
    characterImage: chosenImage,
    characterGender: characterData.characterGender,
  };
};

export default fetchCharacterTraitsAndBio;
