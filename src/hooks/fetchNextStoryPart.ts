import chatGPTRequest from "../chatGPTRequest";
import processJson from "../utils/processJson";
import filterOptionsNew from "../utils/filterOptionsNew";
import { ScenarioType, MoralAlignment, PlayerStats } from '../types/story';
import i18n from '../i18n'; // i18n 인스턴스 import

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
  outcome: 'success' | 'partial' | 'failure';
  scenarioType: ScenarioType;
}

const fetchNextStoryPartAndOptions = async (
  storySummary: string[],
  previousParagraph: string,
  input: { text: string; risk: string },
  chosenCharacter: string,
  chosenGenre: string,
  characterTraits: string[],
  characterBio: string,
  characterGender: string,
  playerStats: PlayerStats,
  scenarioHistory: ScenarioType[],
  moralChoices: MoralAlignment[],
  successfulChoices: boolean[],
  apiKey: string,
  provider: string
): Promise<NextStoryPart> => {
  // Enhanced scenario determination logic
  const determineNextScenario = (): ScenarioType => {
    // Get recent history
    const recentScenarios = scenarioHistory.slice(-5);
    const recentScenarioTypes = new Set(recentScenarios);
    const turnCount = scenarioHistory.length;
    
    // Avoid repeating the same scenario type too frequently
    const lastScenario = recentScenarios[recentScenarios.length - 1];
    const secondLastScenario = recentScenarios[recentScenarios.length - 2];
    
    // Analyze moral choices and success patterns
    const moralTrend = moralChoices.slice(-5).filter(c => c === 'moral').length / 5;
    const immoralTrend = moralChoices.slice(-5).filter(c => c === 'immoral').length / 5;
    const recentSuccessRate = successfulChoices.slice(-5).filter(Boolean).length / 5;
    
    // Force variety by ensuring we don't repeat the last two scenario types
    const availableScenarios: ScenarioType[] = [
      'standard' as ScenarioType, 
      'dilemma' as ScenarioType, 
      'consequence' as ScenarioType, 
      'challenge' as ScenarioType, 
      'companion' as ScenarioType, 
      'betrayal' as ScenarioType, 
      'moral_choice' as ScenarioType
    ].filter(type => type !== lastScenario && type !== secondLastScenario);
    
    // Increase chance of non-standard scenarios as the story progresses
    const standardProbability = Math.max(0.4 - (turnCount / 40), 0.1);
    
    // Special case: force a climactic scenario near the end
    if (turnCount >= 15 && turnCount <= 18) {
      // Near the end, force more dramatic scenarios
      if (!recentScenarioTypes.has('challenge') && !recentScenarioTypes.has('betrayal')) {
        return Math.random() < 0.6 ? 'challenge' : 'betrayal';
      }
    }
    
    // Special story beats based on player stats
    if (playerStats.moralScore < -50 && !recentScenarioTypes.has('consequence') && Math.random() < 0.7) {
      return 'consequence'; // Consequences for very immoral choices
    }
    
    if (playerStats.riskScore > 70 && !recentScenarioTypes.has('challenge') && Math.random() < 0.7) {
      return 'challenge'; // Challenge for risk-takers
    }
    
    // Story structure: introduce companions early
    if (turnCount < 5 && !recentScenarioTypes.has('companion') && Math.random() < 0.5) {
      return 'companion';
    }
    
    // Moral choices should appear more when the player has balanced morality
    if (Math.abs(playerStats.moralScore) < 30 && !recentScenarioTypes.has('moral_choice') && Math.random() < 0.6) {
      return 'moral_choice';
    }
    
    // If player consistently makes moral choices, introduce betrayal
    if (moralTrend > 0.7 && !recentScenarioTypes.has('betrayal') && Math.random() < 0.6) {
      return 'betrayal';
    }
    
    // If player has been consistently immoral, create consequences
    if (immoralTrend > 0.7 && !recentScenarioTypes.has('consequence') && Math.random() < 0.6) {
      return 'consequence';
    }
    
    // Make dilemmas appear more frequently
    if (!recentScenarioTypes.has('dilemma') && Math.random() < 0.3) {
      return 'dilemma';
    }
    
    // If nothing special, randomly select from available scenarios with weighted probability
    const rand = Math.random();
    if (rand < standardProbability) {
      return 'standard';
    } else {
      // Pick randomly from remaining scenarios
      const nonStandardScenarios = availableScenarios.filter(type => type !== 'standard');
      const randomIndex = Math.floor(Math.random() * nonStandardScenarios.length);
      return nonStandardScenarios[randomIndex];
    }
  };
  
  // Enhanced outcome determination
  const determineOutcome = (): 'success' | 'partial' | 'failure' => {
    // Base failure chance on risk level
    const riskFactor = input.risk === 'high' ? 0.4 : 
                      input.risk === 'medium' ? 0.25 : 0.1;
    
    // Trait consistency improves chances
    const consistencyBonus = playerStats.traitConsistency / 200;
    
    // Story dynamics - failures should be less common early and more likely later
    // for dramatic tension
    const turnCount = scenarioHistory.length;
    const turnFactor = Math.min(turnCount / 30, 1) * 0.15;
    
    // Success pattern factor - too many consecutive successes increases failure chance
    const recentSuccesses = successfulChoices.slice(-3).filter(Boolean).length;
    const successPatternFactor = recentSuccesses >= 3 ? 0.2 : 0;
    
    // Calculate final probabilities
    const failureChance = Math.max(0.05, riskFactor - consistencyBonus + turnFactor + successPatternFactor);
    const partialChance = failureChance + 0.3;
    
    // Force occasional failures for dramatic tension
    const forcedFailure = successfulChoices.slice(-5).every(Boolean) && Math.random() < 0.7;
    if (forcedFailure) return 'failure';
    
    const rand = Math.random();
    if (rand < failureChance) return 'failure';
    if (rand < partialChance) return 'partial';
    return 'success';
  };

  const nextScenarioType = determineNextScenario();
  const outcome = determineOutcome();
  const turnCount = scenarioHistory.length;
  const language = i18n.language;

  // Enhanced prompt for more varied scenarios
  const buildPrompt = (scenarioType: ScenarioType, outcome: 'success' | 'partial' | 'failure') => {
    let specialInstructions = "";
    
    if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
      // 한국어 시나리오 타입 설명
      switch(scenarioType) {
        case 'dilemma':
          specialInstructions = `
            이것은 딜레마 시나리오입니다. 명확한 정답이 없는 도덕적 또는 윤리적 딜레마를 제시하세요.
            - 플레이어가 자신의 가치관에 의문을 갖게 만드세요
            - 모든 선택이 의미 있는 결과를 가져오도록 하세요
            - 딜레마를 캐릭터의 특성이나 배경 이야기와 연결하세요
            - 이 선택이 스토리 세계의 다른 사람들에게 어떤 영향을 미칠지 보여주세요
          `;
          break;
        case 'challenge':
          specialInstructions = `
            이것은 도전 시나리오입니다. 캐릭터가 자신의 능력을 시험하는 중요한 장애물에 직면합니다.
            - 긴장감을 조성하고 위험을 높이세요
            - 도전을 캐릭터의 확립된 능력에 적합하게 만드세요
            - 이를 극복하기 위한 직접적이고 창의적인 접근 방식을 모두 제공하세요
            - 실패가 목표에 어떤 영향을 미칠지 보여주세요
          `;
          break;
        // 다른 시나리오 타입에 대한 한국어 설명 추가
        // ...
      }
      
      // 스토리 단계에 따른 한국어 지시사항
      if (turnCount < 5) {
        specialInstructions += `
          초기 스토리 단계: 세계와 캐릭터 동기 확립에 집중하세요.
          - 나중에 발전시킬 수 있는 요소를 소개하세요
          - 미래 갈등의 씨앗을 심으세요
          - 이 세계에서 캐릭터의 역할을 정의하는 데 도움을 주세요
        `;
      } else if (turnCount >= 15) {
        specialInstructions += `
          후기 스토리 단계: 해결을 향해 나아가기 시작하세요.
          - 이전 결정과 그 결과를 상기시키세요
          - 위험과 감정적 투자를 높이세요
          - 스토리라인을 결론으로 이끌기 시작하세요
          - 이전 선택을 기반으로 캐릭터 발전을 심화하세요
        `;
      }
      
      // 최종 한국어 프롬프트
      return `
        한국어로 응답해주세요.
        당신은 "${chosenGenre}" 장르의 "${chosenCharacter}" 캐릭터가 등장하는 텍스트 어드벤처 게임을 이어가는 AI입니다. 이 캐릭터는 ${characterGender}이며, "${characterTraits.join('", "')}"와 같은 특성을 가지고 있고,
        "${characterBio}"라는 배경 이야기가 있습니다. 최근 플롯과 사용자 선택의 요약은 다음과 같습니다: ${storySummary.slice(-16)}. 
        
        플레이어는 다음과 같은 통계를 가진 선택을 했습니다:
        - 도덕 점수: ${playerStats.moralScore} (-100 비도덕적에서 100 도덕적까지)
        - 위험 점수: ${playerStats.riskScore} (0-100)
        - 특성 일관성: ${playerStats.traitConsistency} (0-100)
        - 창의성: ${playerStats.creativity} (0-100)
        - 성공률: ${playerStats.successRate} (0-100)
        
        최근 사건 "${previousParagraph}"와 사용자의 최신 행동 "${input.text}"를 고려하여, 다음 세그먼트(65-200단어)를 작성하세요.
        
        플레이어의 마지막 행동의 결과는: ${outcome === 'success' ? '성공' : outcome === 'partial' ? '부분적 성공' : '실패'}.
        다음 시나리오 유형은: ${scenarioType.toUpperCase()}.
        
        ${specialInstructions}
        
        이것은 스토리의 ${turnCount}번째 턴입니다. 새로운 요소를 도입하면서 내러티브 일관성을 유지하세요.
        
        이 세그먼트는:
        - 이전 사건과 사용자 선택에서 논리적으로 이어져야 합니다.
        - 주인공에게 2인칭("당신" 또는 "당신의")을 사용하세요.
        - 깊이를 높이기 위해 문학적 기법을 사용하세요(예: 복선, 생생한 이미지).
        - 몰입적인 묘사, 서스펜스 구축, 캐릭터 역학 발전을 포함하세요.
        - 액션, 대화, 묘사의 균형을 맞추세요.
        - 모든 캐릭터 특성과 배경 이야기의 관련성을 유지하면서 사용자 결정을 반영하세요.
        - 플레이어의 이전 선택의 ${outcome === 'success' ? '성공' : outcome === 'partial' ? '부분적 성공' : '실패'} 결과를 명확히 보여주세요.
        
        추가 탐색을 위한 3-4개의 선택지를 제공하세요, 각각 구별되고 논리적이어야 합니다:
        - 캐릭터의 특성과 일치하는 옵션을 하나 이상 포함하세요(traitAlignment로 표시)
        - 캐릭터 특성에 반하는 옵션을 하나 이상 포함하세요
        - 다양한 위험 수준(낮음, 중간, 높음)의 옵션을 포함하세요
        - 적절한 경우 도덕적 옵션과 비도덕적 옵션을 각각 하나 이상 포함하세요
        - 각 옵션이 상당히 다른 잠재적 스토리 분기로 이어지도록 하세요
        
        응답을 다음 JSON 형식으로 엄격하게 작성하세요:
        {
          "storySegment": "다음 스토리 세그먼트 텍스트, 65-200단어",
          "options": {
            "option1": { 
              "text": "옵션 텍스트, 10-30단어", 
              "risk": "리스크 낮음, 리스크 중간, 또는 리스크 높음",
              "alignment": "도덕적, 비도덕적, 또는 중립적",
              "traitAlignment": "선택 사항 - 이 옵션이 일치하는 캐릭터 특성"
            },
            // ... 최대 option4까지 동일한 형식으로
          },
          "outcome": "${outcome}",
          "scenarioType": "${scenarioType}"
        }  
      `;
    } else {
    // Add variation based on scenario type
    switch(scenarioType) {
      case 'dilemma':
        specialInstructions = `
          This is a DILEMMA scenario. Present a moral or ethical dilemma with no clear right answer.
          - Make the player question their values
          - Ensure both choices have meaningful consequences
          - Tie the dilemma to the character's traits or backstory
          - Show how this choice will impact others in the story world
        `;
        break;
      case 'challenge':
        specialInstructions = `
          This is a CHALLENGE scenario. The character faces a significant obstacle that tests their abilities.
          - Create tension and raise the stakes
          - Make the challenge appropriate to the character's established abilities
          - Offer both direct and creative approaches to overcome it
          - Show how failure would impact their goals
        `;
        break;
      case 'companion':
        specialInstructions = `
          This is a COMPANION scenario. Introduce or develop a relationship with another character.
          - Create a memorable character with their own motivations
          - Show how they complement or challenge the main character
          - Establish why they might help or hinder the protagonist
          - Provide interaction options that reveal different aspects of both characters
        `;
        break;
      case 'betrayal':
        specialInstructions = `
          This is a BETRAYAL scenario. Someone the character trusted shows signs of betrayal.
          - Create emotional impact through the betrayal
          - Make the betrayal believable within the story context
          - Offer different ways to respond to the betrayal
          - Reveal hidden motives or conflicting loyalties
        `;
        break;
      case 'consequence':
        specialInstructions = `
          This is a CONSEQUENCE scenario. Previous choices have led to this moment.
          - Show clear cause-and-effect relationships to previous decisions
          - Create satisfying payoffs for earlier investments or sacrifices
          - Reveal unexpected side effects of earlier choices
          - Emphasize how the character's actions have changed the world
        `;
        break;
      case 'moral_choice':
        specialInstructions = `
          This is a MORAL_CHOICE scenario. Force a clear ethical decision.
          - Present a situation with significant moral implications
          - Show competing values or priorities at stake
          - Make both moral and immoral choices tempting for different reasons
          - Illustrate potential costs of making the "right" choice
        `;
        break;
      case 'standard':
        specialInstructions = `
          This is a STANDARD scenario. Advance the plot while developing character and world.
          - Balance exploration, dialogue, and action
          - Reveal new information about the story world
          - Create opportunities for character growth
          - Maintain narrative momentum
        `;
        break;
    }
    
    // Add variation based on where we are in the story arc
    if (turnCount < 5) {
      specialInstructions += `
        Early story phase: Focus on establishing the world and character motivations.
        - Introduce elements that can be developed later
        - Plant seeds for future conflicts
        - Help define the character's role in this world
      `;
    } else if (turnCount >= 15) {
      specialInstructions += `
        Late story phase: Begin building toward a resolution.
        - Call back to earlier decisions and their consequences
        - Raise the stakes and emotional investment
        - Start bringing storylines toward conclusion
        - Deepen character development based on previous choices
      `;
    }
    
    // Final prompt with all elements
    return `
      You're an AI continuing our text adventure game featuring "${chosenCharacter}", who is ${characterGender}, in the genre "${chosenGenre}". They have traits like "${characterTraits.join('", "')}",
      and a backstory "${characterBio}". Here's a brief of the recent plot and user choices: ${storySummary.slice(-16)}. 
      
      The player has made choices with these statistics:
      - Moral Score: ${playerStats.moralScore} (-100 immoral to 100 moral)
      - Risk Score: ${playerStats.riskScore} (0-100)
      - Trait Consistency: ${playerStats.traitConsistency} (0-100)
      - Creativity: ${playerStats.creativity} (0-100)
      - Success Rate: ${playerStats.successRate} (0-100)
      
      Given the recent events "${previousParagraph}" and the user's latest action "${input.text}", craft the next segment (65-200 words).
      
      The outcome of the player's last action is: ${outcome.toUpperCase()}.
      The next scenario should be of type: ${scenarioType.toUpperCase()}.
      
      ${specialInstructions}
      
      This is turn #${turnCount} of the story. Maintain narrative consistency while introducing fresh elements.
      
      This segment should:
      - Follow logically from previous events and user choices.
      - Use second person for the main character.
      - Incorporate literary techniques to enhance depth (e.g., foreshadowing, vivid imagery).
      - Include immersive descriptions, build suspense, and develop character dynamics.
      - Offer balanced action, dialogue, and descriptions.
      - Reflect user decisions, maintaining all character traits and backstory relevance.
      - Clearly show the ${outcome} outcome of the player's previous choice.
      
      Provide 3-4 choices for further exploration, each distinct and logical:
      - Include at least one option aligned with the character's traits (mark with traitAlignment)
      - Include at least one option that goes against character traits
      - Include options with varying risk levels (low, medium, high)
      - Include at least one moral and one immoral option when appropriate
      - Make sure each option leads to significantly different potential story branches
      
      Strictly put your responses in this JSON format:
      {
        "storySegment": "Text of the next story segment, 65-200 words",
        "options": {
          "option1": { 
            "text": "Option text, 10-30 words", 
            "risk": "low risk, medium risk, or high risk",
            "alignment": "moral, immoral, or neutral",
            "traitAlignment": "optional - name of character trait this aligns with"
          },
          // ... up to option4 in the same format
        },
        "outcome": "${outcome}",
        "scenarioType": "${scenarioType}"
      }  
    `;
    }
  };

  const prompt = buildPrompt(nextScenarioType, outcome);

  while (true) {
    try {
      const response = await chatGPTRequest(prompt, apiKey, provider);
      const responseObject: NextStoryPart = processJson<NextStoryPart>(
        response[0]
      );

      const filteredOptions = filterOptionsNew(responseObject.options);
      responseObject.options = filteredOptions;

      return responseObject;
    } catch (error: any) {
      console.error("Error processing response retrying");
    }
  }
};

const fetchStorySummary = async (
  storySegment: string,
  apiKey: string,
  provider: string
): Promise<string> => {
  const language = i18n.language;
  let prompt2 = '';
  
  if (language === 'kr' || language === 'ko' || language === 'ko-KR') {
    prompt2 = `
      한국어로 응답해주세요.
      이 스토리 세그먼트 "${storySegment}"의 간결한 요약을 40단어 이내의 한 단락으로 작성하세요. 요약에는 다음이 포함되어야 합니다:
      - 캐릭터 상호작용(행동, 대화, 감정, 반응)
      - 캐릭터의 정확한 위치와 위치 변화
      - 각 캐릭터의 현재 소지품(아이템 획득, 사용 또는 손실)
      - 캐릭터 관계의 변화(동맹, 갈등, 상호작용)
      - 이야기나 캐릭터에 영향을 미치는 주요 사건이나 발견
      - 내러티브 일관성과 연속성을 위한 기타 중요한 세부 사항

      응답을 다음 JSON 형식으로 엄격하게 작성하세요:

      {
        "storySummary": "{스토리 세그먼트 요약}",
      }
    `;
  } else {
    prompt2 = `
      Write a concise summary of this story segment "${storySegment}" in one paragraph no more than 40 words. The summary should include:
      - Character interactions (actions, dialogues, emotions, reactions)
      - Exact locations of characters and changes in location
      - Current inventory of each character (acquisition, usage, or loss of items)
      - Changes in character relationships (alliances, conflicts, interactions)
      - Key events or discoveries that affect the story or characters
      - Any other important details for narrative consistency and continuity

      Strictly put your responses in this JSON format:

      {
        "storySummary": "{summary of the story segment}",
      }
    `;
  }

  while (true) {
    try {
      const response = await chatGPTRequest(prompt2, apiKey, provider);
      const responseObject = processJson<{ storySummary: string }>(response[0]);
      return responseObject.storySummary; // Return summary on success
    } catch (error: any) {
      console.error("Failed to parse retrying");
    }
  }
};

export { fetchNextStoryPartAndOptions, fetchStorySummary };