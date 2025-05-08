import chatGPTRequest from "../chatGPTRequest";
import processJson from "../utils/processJson";
import filterOptionsNew from "../utils/filterOptionsNew";
import { MoralAlignment, ScenarioType, PlayerStats } from '../types/story';
import i18n from '../i18n';

interface NextStoryPart {
  storySegment: string;
  options: { 
    [key: string]: { 
      text: string; 
      risk: string; 
      alignment: MoralAlignment;
      traitAlignment?: string;
    } 
  };
  isFinal: boolean;
  outcome: 'success' | 'partial' | 'failure';
  scenarioType: ScenarioType;
}

interface StorySummary {
  wrapUpParagraph: string;
  bigMoment: string;
  frequentActivity: string;
  characterTraitHighlight: string;
  themeExploration: string;
  overallScore: number;
  scoreBreakdown: {
    decisions: number;
    consistency: number;
    creativity: number;
    morality: number;
  };
  endingType: string;
}

const formatStorySummary = (storySummary: string[]): string => {
  return storySummary
    .map((part, index) => `${index + 1}: ${part}`)
    .join("\n");
};

const fetchEndingStoryPartAndOptions = async (
  storySummary: string[],
  previousParagraph: string,
  input: { text: string; risk: string; alignment?: MoralAlignment },
  chosenCharacter: string,
  chosenGenre: string,
  characterTraits: string[],
  characterBio: string,
  characterGender: string,
  apiKey: string,
  provider: string,
  playerStats?: PlayerStats
): Promise<NextStoryPart> => {
  const language = i18n.language;
  let prompt = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    prompt = `
    한국어로 응답해주세요.
    당신은 텍스트 기반 어드벤처 게임의 다음 단계를 안내하는 AI입니다. 우리의 주인공은 "${chosenCharacter}"이며, ${characterGender}이고, "${chosenGenre}" 장르에 속합니다. 이 캐릭터는 독특한 특성 [${characterTraits.join(", ")}]과 매력적인 배경 이야기 "${characterBio}"를 가지고 있으며, 이야기의 중심에 있습니다.
    
    지난 16턴의 요약을 반영하면: ${formatStorySummary(storySummary.slice(-16))}, 그리고 사용자의 최근 선택 "${input.text}"을 고려할 때, 이야기가 절정에 도달하고 결론을 내려야 하는지, 아니면 매력적인 해결책을 향해 더 발전해야 하는지 결정하세요.
    
    ${playerStats ? `
    플레이어 통계:
    - 도덕성 점수: ${playerStats.moralScore} (-100 비도덕적에서 100 도덕적까지)
    - 위험 점수: ${playerStats.riskScore} (0-100)
    - 특성 일관성: ${playerStats.traitConsistency} (0-100)
    - 창의성: ${playerStats.creativity} (0-100)
    - 성공률: ${playerStats.successRate} (0-100)
    
    이러한 통계를 기반으로 적절한 결말이나 연속을 만드세요:
    - 도덕성 점수가 매우 낮다면, 더 어둡거나 도덕적으로 모호한 결말을 고려하세요
    - 위험 점수가 높다면, 결말은 그들이 직면한 위험을 반영해야 합니다
    - 특성 일관성이 높다면, 캐릭터의 진실성에 보상을 주세요
    - 창의성이 높다면, 혁신적인 접근 방식을 인정하세요
    - 성공률이 낮다면, 결말이 더 달콤쓸쓸할 수 있습니다
    ` : ''}
    
    - 결론을 내릴 경우: 'isFinal'을 true로 설정하세요. 이야기의 진행, 주제적 요소, 캐릭터 발전과 일치하는 적절한 해결책을 제공하는 최종 세그먼트(65-200 단어)를 작성하세요. 내러티브는 복잡한 동기, 얽힌 서브플롯이나 배경 요소를 포착하고, 서스펜스나 카타르시스와 같은 강한 감정적 반응을 불러일으켜야 합니다.
    - 계속할 경우: 'isFinal'을 false로 설정하세요. 긴장감을 높이고 절정을 향해 진행하면서 이야기를 더 발전시키세요. 복선, 비선형 내러티브, 생생한 이미지와 같은 문학적 기법을 사용하여 깊이와 흥미를 높이는 혁신적인 반전을 도입하세요. 클리셰를 피하고 각 세그먼트가 몰입적이고 상세하며 사용자 결정의 중요성을 존중하도록 하세요.
    
    두 시나리오 모두:
    - 플레이어와 매력적이고 개인적인 연결을 유지하기 위해 2인칭("당신" 또는 "당신의")을 사용하세요.
    - 장면에 생명을 불어넣고, 참여도를 높이고, 서스펜스를 구축하는 상세하고 몰입적인 설명을 포함하세요.
    - 이야기가 이전 세그먼트에서 논리적으로 진행되도록 하고, 사용자 선택을 반영하고 그것을 기반으로 구축하세요.
    - 캐릭터 관계와 역학을 발전시켜 내러티브 구조를 풍부하게 하고, 균형 잡힌 경험을 위해 액션, 대화, 설명적 요소의 균형을 맞추세요.
    
    이야기를 진행하거나 결론짓는 것뿐만 아니라 각 결정과 이야기 발전을 기억에 남고 영향력 있게 만들어 플레이어의 경험을 풍부하게 하는 내러티브를 전달하는 데 집중하세요.
    
    계속할 경우, 다양한 위험 수준과 도덕적 정렬을 가진 2-4개의 옵션을 제공하세요.
    
    다음 JSON 형식으로 응답을 엄격하게 작성하세요:
    {
      "storySegment": "최종 또는 진행 중인 이야기 세그먼트의 텍스트",
      "options": {
        "option1": { 
          "text": "옵션 텍스트, 10-30 단어", 
          "risk": "낮음, 중간, 또는 높음",
          "alignment": "도덕적, 비도덕적, 또는 중립적",
          "traitAlignment": "선택 사항 - 이 옵션이 일치하는 캐릭터 특성 이름"
        },
        // ... 같은 형식으로 최대 option4까지
      },
      "isFinal": 이야기를 결론짓는 경우 true, 그렇지 않으면 false
    }
    `;
  } else {
    prompt = `
    You are an AI guiding the next steps in our text-based adventure game. Remember, our main character is "${chosenCharacter}", who is ${characterGender}, belonging to the genre "${chosenGenre}". This character, endowed with unique traits [${characterTraits.join(", ")}] and a compelling backstory "${characterBio}", is at the crux of the narrative.
    
    Reflecting on the summary of the last 16 turns here: ${formatStorySummary(storySummary.slice(-16))}, and taking into account the user's recent choice "${input.text}", decide if the story should climax and conclude, or if it needs to escalate towards a compelling resolution.
    
    ${playerStats ? `
    PLAYER STATISTICS:
    - Moral Score: ${playerStats.moralScore} (-100 immoral to 100 moral)
    - Risk Score: ${playerStats.riskScore} (0-100)
    - Trait Consistency: ${playerStats.traitConsistency} (0-100)
    - Creativity: ${playerStats.creativity} (0-100)
    - Success Rate: ${playerStats.successRate} (0-100)
    
    Based on these statistics, craft an appropriate ending or continuation:
    - If moral score is very negative, consider a darker or more morally ambiguous ending
    - If risk score is high, the ending should reflect the dangers they've faced
    - If trait consistency is high, reward their character integrity
    - If creativity is high, acknowledge their innovative approach
    - If success rate is low, the ending may be more bittersweet
    ` : ''}
    
    - If concluding: Set 'isFinal' to true. Craft a final segment (65-200 words) that delivers a fitting resolution aligned with the story's progression, thematic elements, and character development. The narrative should capture complex motivations, intertwining subplots or backstory elements, and evoke a strong emotional response like suspense or catharsis.
    - If continuing: Set 'isFinal' to false. Develop the story further, heightening tension and progressing towards a climax. Introduce innovative twists, employing literary techniques such as foreshadowing, non-linear narratives, or vivid imagery to enhance depth and interest. Avoid clichés and ensure each segment is immersive, detailed, and respects the gravity of user decisions.
    
    In both scenarios:
    - Use second person ("you" or "your") to maintain an engaging, personal connection with the player.
    - Include detailed, immersive descriptions that bring scenes to life, heighten engagement, and build suspense.
    - Ensure the story progresses logically from previous segments, reflecting user choices and building upon them.
    - Develop character relationships and dynamics, enriching the narrative fabric and balancing action, dialogue, and descriptive elements for a well-rounded experience.
    
    Focus on delivering a narrative that not only advances or concludes the story but also enriches the player's experience by making each decision and story development memorable and impactful.
    
    If continuing, provide 2-4 options with varying risk levels and moral alignments.
    
    Strictly put your responses in this JSON format:
    {
      "storySegment": "Text of the final or ongoing story segment",
      "options": {
        "option1": { 
          "text": "Option text, 10-30 words", 
          "risk": "low, medium, or high",
          "alignment": "moral, immoral, or neutral",
          "traitAlignment": "optional - name of character trait this aligns with"
        },
        // ... up to option4 in the same format
      },
      "isFinal": true if concluding the story, otherwise false
    }
    `;
  }

  let response;
  let responseObject: NextStoryPart = {
    storySegment: "",
    options: {},
    isFinal: false,
    outcome: 'success', // 기본 결과
    scenarioType: 'standard' // 기본 시나리오 유형
  };
  let success = false;

  while (!success) {
    try {
      response = await chatGPTRequest(prompt, apiKey, provider);
      responseObject = processJson<NextStoryPart>(response[0]);

      const filteredOptions = filterOptionsNew(responseObject.options);
      responseObject.options = filteredOptions;

      success = true;
    } catch (error) {
      console.error("Error processing response, retrying request...", error);
    }
  }

  return responseObject;
};

const fetchDetailedStorySummary = async (
  storySummary: string[],
  playerStats: PlayerStats,
  apiKey: string,
  provider: string
): Promise<StorySummary> => {
  const language = i18n.language;
  let prompt = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    prompt = `
    한국어로 응답해주세요.
    마치 스포티파이 래핑처럼 이 모험에 대한 "스토리 래핑"을 만든다고 상상해보세요! 아래는 전체 이야기 진행과 플레이어 통계입니다:
    
    이야기 요약:
    ${formatStorySummary(storySummary)}
    
    플레이어 통계:
    - 도덕성 점수: ${playerStats.moralScore} (-100 비도덕적에서 100 도덕적까지)
    - 위험 점수: ${playerStats.riskScore} (0-100)
    - 특성 일관성: ${playerStats.traitConsistency} (0-100)
    - 창의성: ${playerStats.creativity} (0-100)
    - 성공률: ${playerStats.successRate} (0-100)
    
    이러한 통계와 이야기 진행을 기반으로 모험의 본질을 담아낸 생생하고 공유 가능한 요약을 만드세요:
    
    1. **에픽 리캡**: 이야기의 재미있고 캐치한 요약을 만드세요. 베스트셀러 소설의 뒷표지처럼 생각하세요.
    2. **쇼스토퍼 순간**: 이야기에서 가장 스릴 넘치거나 재미있는 순간을 찾아내세요. 이야기 세계에서 헤드라인을 장식할 만한 순간이요!
    3. **시그니처 무브**: 캐릭터가 계속해서 하지 않을 수 없었던 한 가지는 무엇인가요? 팬들이 트윗할 만한 재미있는 플롯 특징처럼 들리게 만드세요.
    4. **캐릭터 특성**: 이야기를 독특하게 만든 주인공의 재미있거나 정의적인 특성을 조명하세요.
    5. **테마 송**: 이 이야기가 탐구한 주요 테마를 기반으로 테마 송이 있다면, 어떤 것일까요? 이야기의 분위기와 어울리는 재미있는 방식으로 설명하세요.
    6. **전체 점수**: 플레이어의 선택, 창의성, 그리고 그들이 만든 전체 내러티브를 기반으로 1-100 척도로 여정을 평가하세요.
    7. **점수 분석**: 다음에 대한 점수(1-100)를 제공하세요:
       - 결정 품질: 그들의 선택이 얼마나 현명했나요? (성공률 기반)
       - 캐릭터 일관성: 그들이 얼마나 잘 캐릭터에 충실했나요?
       - 창의적 문제 해결: 그들의 해결책이 얼마나 혁신적이었나요?
       - 도덕적 나침반: 그들의 결정이 얼마나 윤리적이었나요? (도덕적일수록 높음, 비도덕적일수록 낮음)
    8. **결말 유형**: 플레이어의 도덕 점수와 성공률을 기반으로 결말을 분류하세요:
       - "영웅적 승리" (높은 도덕, 높은 성공)
       - "피로스의 승리" (높은 도덕, 낮은 성공)
       - "안티히어로 승리" (낮은 도덕, 높은 성공)
       - "비극적 몰락" (낮은 도덕, 낮은 성공)
       - "달콤쓸쓸한 해결" (혼합된 도덕, 혼합된 성공)
       - 또는 그들의 독특한 결말을 가장 잘 설명하는 다른 적합한 카테고리
    
    다음 JSON 형식으로 응답을 작성하세요:
    {
      "wrapUpParagraph": "{에픽 리캡 텍스트}",
      "bigMoment": "{쇼스토퍼 순간}",
      "frequentActivity": "{시그니처 무브}",
      "characterTraitHighlight": "{캐릭터 특성}",
      "themeExploration": "{테마 송}",
      "overallScore": 1-100 사이의 숫자,
      "scoreBreakdown": {
        "decisions": 1-100 사이의 숫자,
        "consistency": 1-100 사이의 숫자,
        "creativity": 1-100 사이의 숫자,
        "morality": 1-100 사이의 숫자
      },
      "endingType": "결말 유형"
    }
    `;
  } else {
    prompt = `
    Imagine you're creating a "Story Wrapped" for this adventure, much like Spotify Wrapped but for the epic tale we've just experienced! Below is the entire story progression and player statistics:
    
    STORY SUMMARY:
    ${formatStorySummary(storySummary)}
    
    PLAYER STATISTICS:
    - Moral Score: ${playerStats.moralScore} (-100 immoral to 100 moral)
    - Risk Score: ${playerStats.riskScore} (0-100)
    - Trait Consistency: ${playerStats.traitConsistency} (0-100)
    - Creativity: ${playerStats.creativity} (0-100)
    - Success Rate: ${playerStats.successRate} (0-100)
  
    Based on these statistics and the story progression, create a vibrant and shareable summary that captures the essence of the adventure:
    
    1. **Epic Recap**: Whip up a catchy and fun summary of the story. Think of it as the back cover of a best-selling novel.
    2. **Showstopper Moment**: Pinpoint the most thrilling or hilarious moment in the story. The kind of moment that would make headlines in the story world!
    3. **Signature Move**: What's one thing the character just couldn't stop doing? Make it sound like a fun plot quirk that fans would tweet about.
    4. **Character Quirk**: Shine a light on a hilarious or defining trait of the main character that made the story uniquely theirs.
    5. **Theme Song**: If this story had a theme song, based on the main themes explored, what would it be? Describe it in a fun way that matches the story's vibe.
    6. **Overall Score**: Rate the player's journey on a scale of 1-100 based on their choices, creativity, and the overall narrative they created.
    7. **Score Breakdown**: Provide scores (1-100) for:
       - Decision Quality: How wise were their choices? (Based on success rate)
       - Character Consistency: How well did they stay true to their character?
       - Creative Problem-Solving: How innovative were their solutions?
       - Moral Compass: How ethical were their decisions? (Higher for moral, lower for immoral)
    8. **Ending Type**: Classify the ending based on the player's moral score and success rate:
       - "Heroic Victory" (high moral, high success)
       - "Pyrrhic Victory" (high moral, low success)
       - "Antihero Triumph" (low moral, high success)
       - "Tragic Downfall" (low moral, low success)
       - "Bittersweet Resolution" (mixed moral, mixed success)
       - Or another fitting category that best describes their unique ending
  
    Please format the responses like this, ready to be shared and enjoyed on social media in this JSON format:
    {
      "wrapUpParagraph": "{Epic Recap text}",
      "bigMoment": "{Showstopper Moment}",
      "frequentActivity": "{Signature Move}",
      "characterTraitHighlight": "{Character Quirk}",
      "themeExploration": "{Theme Song}",
      "overallScore": number between 1-100,
      "scoreBreakdown": {
        "decisions": number between 1-100,
        "consistency": number between 1-100,
        "creativity": number between 1-100,
        "morality": number between 1-100
      },
      "endingType": "Type of ending"
    }
    `;
  }

  let response;
  let responseObject: StorySummary = {
    wrapUpParagraph: "",
    bigMoment: "",
    frequentActivity: "",
    characterTraitHighlight: "",
    themeExploration: "",
    overallScore: 0,
    scoreBreakdown: {
      decisions: 0,
      consistency: 0,
      creativity: 0,
      morality: 0
    },
    endingType: ""
  };
  let success = false;

  while (!success) {
    try {
      response = await chatGPTRequest(prompt, apiKey, provider);
      responseObject = processJson<StorySummary>(response[0]);
      success = true;
    } catch (error) {
      console.error("Error processing response, retrying request...", error);
    }
  }

  return responseObject;
};

export { fetchEndingStoryPartAndOptions, fetchDetailedStorySummary };
