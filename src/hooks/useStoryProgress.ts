// src/hooks/useStoryProgress.ts
import { useContext } from "react";
import { AppContext } from "../AppContext";
import {
  fetchNextStoryPartAndOptions,
  fetchStorySummary,
} from "./fetchNextStoryPart";
import {
  fetchEndingStoryPartAndOptions,
  fetchDetailedStorySummary,
} from "./fetchEndingStoryPartAndOptions";
import { saveOrUpdateStory } from "../helpers/indexedDB";
import { MoralAlignment, ScenarioType } from "../types/story";

interface Option {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string;
}

const useStoryProgress = () => {
  const { state, setState } = useContext(AppContext);
  const {
    storySummary,
    previousParagraph,
    chosenCharacter,
    chosenGenre,
    characterTraits,
    characterBio,
    characterGender,
    apiKey,
    provider,
    turnCount,
    playerStats,
    scenarioHistory,
    moralChoices,
    successfulChoices
  } = state;

  // 플레이어 통계 업데이트 함수
  const updatePlayerStats = (option: Option, outcome: string) => {
    const newStats = { ...playerStats };
    
    // 위험 점수 업데이트
    const riskValue = option.risk === 'high' ? 8 : 
                     option.risk === 'medium' ? 5 : -5;
    newStats.riskScore = Math.min(100, Math.max(0, newStats.riskScore + riskValue));
    
    // 도덕성 점수 업데이트
    const moralValue = option.alignment === 'moral' ? 10 : 
                      option.alignment === 'immoral' ? -10 : 0;
    newStats.moralScore = Math.max(-100, Math.min(100, newStats.moralScore + moralValue));
    
    // 특성 일관성 업데이트
    if (option.traitAlignment) {
      newStats.traitConsistency = Math.min(100, newStats.traitConsistency + 5);
    } else {
      newStats.traitConsistency = Math.max(0, newStats.traitConsistency - 3);
    }
    
    // 성공률 업데이트 - 새로운 방식 적용
    // 부분 성공은 카운트하지 않고, 성공/(성공+실패) 비율로 계산
    const successCount = successfulChoices.filter(result => result === 'success').length + (outcome === 'success' ? 1 : 0);
    const failureCount = successfulChoices.filter(result => result === 'failure').length + (outcome === 'failure' ? 1 : 0);
    
    // 성공 또는 실패가 있을 경우에만 계산
    if (successCount + failureCount > 0) {
      newStats.successRate = Math.round((successCount / (successCount + failureCount)) * 100);
    } else {
      newStats.successRate = 0;
    }
    
    // 창의성 점수는 위험 선택과 결과 조합으로 업데이트 - 위험한 선택이 성공했을 때만 +8
    if (option.risk === 'high' && outcome === 'success') {
      newStats.creativity = Math.min(100, newStats.creativity + 8);
    }
    
    return newStats;
  };

  const handleUserInput = async (option: Option) => {
    console.log("User selected option with traitAlignment:", option.traitAlignment);
    
    try {
      let storySegment: string;
      let options: any;
      let isFinal = false;
      let outcome = 'success';
      let scenarioType: ScenarioType = 'standard';
      
      setState((prevState) => ({ ...prevState, isLoading: true }));

      let response,
        wrapUpDetails = {};

      if (turnCount >= 7) {
        response = await fetchEndingStoryPartAndOptions(
          storySummary,
          previousParagraph,
          option,
          chosenCharacter,
          chosenGenre,
          characterTraits,
          characterBio,
          characterGender,
          apiKey,
          provider,
          playerStats // 플레이어 통계 전달
        );
        storySegment = response.storySegment;
        options = response.options;
        isFinal = response.isFinal;

        if (isFinal) {
          wrapUpDetails = await fetchDetailedStorySummary(
            storySummary,
            playerStats,
            apiKey,
            provider
          );
        }
      } else {
        response = await fetchNextStoryPartAndOptions(
          storySummary,
          previousParagraph,
          option,
          chosenCharacter,
          chosenGenre,
          characterTraits,
          characterBio,
          characterGender,
          playerStats,
          scenarioHistory,
          moralChoices,
          successfulChoices.map(outcome => outcome === 'success'),
          apiKey,
          provider
        );
        storySegment = response.storySegment;
        options = response.options;
        outcome = response.outcome || 'success';
        scenarioType = response.scenarioType || 'standard';
      }

      const newStorySummary = await fetchStorySummary(
        storySegment,
        apiKey,
        provider
      );
      
      // 플레이어 통계 업데이트
      const updatedStats = updatePlayerStats(option, outcome);
      
      // 선택 히스토리 업데이트
      const newMoralChoices = [...moralChoices, option.alignment];
      const newSuccessfulChoices = [...successfulChoices, outcome];
      const newScenarioHistory = [...scenarioHistory, scenarioType];

      const normalizedOptions: { [key: string]: Option } = {};

      // options가 객체인지 확인 후 처리
      if (options && typeof options === 'object') {
        Object.entries(options).forEach(([key, opt]) => {
          const option = opt as any;
          normalizedOptions[key] = {
            text: option.text || '',
            risk: option.risk || 'low',
            alignment: option.alignment || 'neutral' as MoralAlignment,
            traitAlignment: option.traitAlignment || undefined
          };
        });
      }

      setState((prevState) => {
        const newState = {
          ...prevState,
          storySummary: [
            ...prevState.storySummary,
            " :USERS CHOICE: " + option.text + " : " + newStorySummary,
          ],
          storyAndUserInputs: [
            ...prevState.storyAndUserInputs,
            option.text,
            storySegment,
          ],
          turnCount: prevState.turnCount + 1,
          previousParagraph: storySegment,
          options: normalizedOptions, // 정규화된 옵션 사용
          playerStats: updatedStats,
          moralChoices: newMoralChoices,
          successfulChoices: newSuccessfulChoices,
          scenarioHistory: newScenarioHistory,
          isLoading: false,
          ...(isFinal
            ? {
                isFinal: true,
                gameState: "endingScreen",
                ...wrapUpDetails,
              }
            : {}),
        };
        
        // 다음 프레임에서 최신 상태로 저장하기 위해 setTimeout 사용
        setTimeout(() => {
          try {
            const updatedState = {...state, ...newState};
            console.log("Saving story after user input, turn:", updatedState.turnCount);
            saveOrUpdateStory(updatedState);
          } catch (error) {
            console.error("Error saving story after user input:", error);
          }
        }, 100);
        
        return newState;
      });
    } catch (error) {
      console.error("Failed to process story progression:", error);
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: "Failed to fetch story data, please try again.",
      }));
    }
  };
  return handleUserInput;
};

export default useStoryProgress;
