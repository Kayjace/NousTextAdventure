import chatGPTRequest from "../chatGPTRequest";
import processJson from "../utils/processJson";
import filterOptionsNew from "../utils/filterOptionsNew";
import { MoralAlignment } from "../types/story";
import i18n from '../i18n'; // i18n 인스턴스 import

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment; // 필수 속성 추가
  traitAlignment?: string; // 선택적 속성 추가
}

interface StartOfStory {
  storyStart: string;
  options: { [key: string]: { text: string; risk: string } };
}

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const defaultDelayMs = 5000; // Default delay of 5000 ms

const fetchStoryStart = async (
  chosenGenre: string,
  chosenCharacter: string,
  characterTraits: string[],
  characterBio: string,
  characterGender: string,
  apiKey: string,
  provider: string
): Promise<StartOfStory> => {
  const language = i18n.language;
  let prompt1 = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    prompt1 = `
    한국어로 응답해주세요.
    다음 지시사항을 주의 깊게 읽어주세요:
    당신은 텍스트 기반 어드벤처 게임을 작성하는 AI입니다. 주인공은 ${chosenCharacter}이며, ${characterGender}이고, 다음과 같은 특성을 가지고 있습니다: "${characterTraits.join('", "')}" 그리고 이러한 배경 이야기가 있습니다: "${characterBio}".
    게임의 장르는 ${chosenGenre}입니다. 먼저, 모험을 시작하는 매력적인 오프닝 장면(65-200단어)을 작성하세요. 다음 사항을 확인하세요:
    - 주인공을 지칭할 때 "당신" 또는 "당신의"라고 사용하세요
    - 장르 내에서 독특하고 잘 알려지지 않은 배경을 선택하세요
    - 생생한 언어를 사용하여 매력적인 문장을 작성하세요
    - 서스펜스와 긴장감을 구축하세요
    - 실제 결과를 가져오는 선택지를 소개하세요
    - 캐릭터 간의 관계를 제시하세요
    - 액션, 대화, 묘사의 균형을 맞추세요
    - 반전과 기대를 뒤엎는 요소로 독자를 놀라게 하세요
    - 장면의 분위기와 분위기를 설정하세요
    - 클리셰와 과도하게 사용된 트로프를 피하세요
    - 현재 장면에 맞는 경우에만 캐릭터의 특성과 배경 이야기를 포함하세요

    둘째, 이야기를 계속할 2-4개의 게임 옵션을 만드세요. 각 옵션(10-30단어)은 플레이어가 장면을 탐색하거나 캐릭터와 상호 작용할 수 있게 해야 합니다. 각 옵션이 게임의 설정에 맞고, 다른 이야기 경로로 이어지며, 위험 수준(낮음, 중간, 높음)을 포함하는지 확인하세요. 가능하다면 "위험한" 옵션을 포함하세요.
    현재 장면에 특화되고 독특한 옵션을 만들고, 옵션 생성에 흔한 트로프를 피하세요.
    
    각 옵션에 대해 다음 사항을 포함하세요:
    - 위험 수준(낮음, 중간, 높음)
    - 도덕적 정렬(도덕적, 비도덕적, 중립적)
    - 가능한 경우 캐릭터 특성과의 일치 여부(traitAlignment)

    응답을 다음 JSON 형식으로 엄격하게 작성하세요:
    {
      "storyStart": "{오프닝 단락 또는 장면, 65-200단어}",
      "options": {
        "option1": { 
          "text": "{옵션 텍스트, 10-30단어}",
          "risk": "{위험 수준, 낮음, 중간, 높음}",
          "alignment": "{도덕적, 비도덕적, 또는 중립적}",
          "traitAlignment": "{선택 사항 - 이 옵션이 일치하는 캐릭터 특성}"
        },
        // ... 최대 option4까지 동일한 형식으로
      }
    }
    `;
  } else {
    prompt1 = `
    Please read the following instructions carefully before proceeding:
    You're an AI writing a text-based adventure game. The protagonist is ${chosenCharacter}, who is ${characterGender}, with these quirks: "${characterTraits.join('", "')}" and this backstory: "${characterBio}".
    The genre of our game is ${chosenGenre}. First, Craft a compelling opening scene (65-200 words) that starts the adventure. Make sure to:
    - When addressing the main character refer to them as "you" or "your"
    - Choose a unique and lesser-known setting within the genre.
    - Use vivid language to write engaging sentences
    - Build suspense and tension
    - Introduce choices that have real consequences
    - Present relationships between characters
    - Balance action, dialogue, and description
    - Surprise the reader with twists and subverted expectations
    - Set the mood and atmosphere of the scene
    - Avoid clichés and overused tropes
    - Only incorporate characters quirks and backstory if they fit the current scene

    Second, create 2 to 4 game options that continue the story. Each option (10-30 words) should allow the player to explore the scene or interact with characters. Make sure each option fits the game's setting, leads to different story paths, and includes a risk level (low, medium, high). Include a "risky" option if possible.
    Try to make options specific and unique to the current scene, also avoid common tropes for creating options.
    
    For each option, include:
    - Risk level (low, medium, high)
    - Moral alignment (moral, immoral, or neutral)
    - Character trait alignment where applicable (traitAlignment)

    Strictly put your responses in this JSON format:
    {
      "storyStart": "{opening paragraph or scene, 65-200 words}",
      "options": {
        "option1": { 
          "text": "{option text, 10-30 words}",
          "risk": "{risk level, low, medium, high}",
          "alignment": "{moral, immoral, or neutral}",
          "traitAlignment": "{optional - name of character trait this aligns with}"
        },
        // ... up to option4 in the same format
      }
    }
    `;
  }

  let attempts = 0;
  const maxAttempts = 5; // Maximum number of attempts before failing

  while (attempts < maxAttempts) {
    try {
      const response = await chatGPTRequest(prompt1, apiKey, provider);
      const responseObject: StartOfStory = processJson<StartOfStory>(
        response[0]
      );

      // 옵션 객체를 Option 인터페이스에 맞게 변환
      const processedOptions: { [key: string]: Option } = {};
      
      console.log("Original start options from AI:", JSON.stringify(responseObject.options, null, 2));
      
      // 각 옵션에 필수 속성 추가
      Object.entries(responseObject.options).forEach(([key, option]: [string, any]) => {
        processedOptions[key] = {
          text: option.text,
          risk: option.risk,
          alignment: (option.alignment || 'neutral') as MoralAlignment, // 기본값으로 'neutral' 설정
          traitAlignment: option.traitAlignment || '' // 명시적으로 빈 문자열 설정
        };
      });

      console.log("Processed start options:", JSON.stringify(processedOptions, null, 2));

      // 변환된 옵션을 filterOptionsNew에 전달
      const filteredOptions = filterOptionsNew(processedOptions);
      console.log("Filtered start options:", JSON.stringify(filteredOptions, null, 2));
      
      responseObject.options = filteredOptions;

      return responseObject; // Return response on success
    } catch (error: any) {
      console.error("Failed to parse retrying");
      attempts++;
    }
  }
  throw new Error("Max retry attempts reached, unable to fetch data.");
};

const fetchStorySummary = async (
  storyStart: string,
  apiKey: string,
  provider: string
): Promise<string> => {
  const language = i18n.language;
  let prompt2 = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    prompt2 = `
    한국어로 응답해주세요.
    다음 이야기 시작을 바탕으로: "${storyStart}", 오프닝 스토리 세그먼트의 간결한 요약을 한 단락으로 작성하세요. 요약에는 다음이 포함되어야 합니다:
    - 캐릭터 상호작용 요약(행동, 대화, 감정, 반응)
    - 캐릭터의 정확한 위치와 위치 변화
    - 각 캐릭터의 현재 소지품(아이템 획득, 사용 또는 손실)
    - 캐릭터 관계의 변화(동맹, 갈등, 상호작용)
    - 이야기나 캐릭터에 영향을 미치는 주요 사건이나 발견
    - 내러티브 일관성과 연속성을 위한 기타 중요한 세부 사항

    응답을 다음 JSON 형식으로 엄격하게 작성하세요:
    {
      "newStorySummary": "{스토리 세그먼트 요약}",
    }
    `;
  } else {
    prompt2 = `
    Given the following story start: "${storyStart}", write a concise summary of the opening story segment in one paragraph. The summary should include:
    - A summary of character interactions (actions, dialogues, emotions, reactions)
    - Exact locations of characters and changes in location
    - Current inventory of each character (acquisition, usage, or loss of items)
    - Changes in character relationships (alliances, conflicts, interactions)
    - Key events or discoveries that affect the story or characters
    - Any other important details for narrative consistency and continuity

    Strictly put your responses in this JSON format:
    {
      "newStorySummary": "{summary of story segment}",
    }
    `;
  }

  let attempts = 0;
  const maxAttempts = 10; // Maximum number of retry attempts

  while (attempts < maxAttempts) {
    try {
      const response = await chatGPTRequest(prompt2, apiKey, provider);
      const responseObject = processJson<{ newStorySummary: string }>(
        response[0]
      );
      return responseObject.newStorySummary; // Successfully return the summary
    } catch (error: any) {
      console.error("Failed to parse retrying");
      attempts++;
    }
  }
  throw new Error("Max retry attempts reached, unable to fetch data.");
};

export { fetchStoryStart, fetchStorySummary };
