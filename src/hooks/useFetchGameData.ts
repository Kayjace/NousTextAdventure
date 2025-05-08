import { useEffect, useContext } from "react";
import { AppContext } from "../AppContext";
import fetchCharacterTraitsAndBio from "./fetchCharacterTraitsAndBio";
import { fetchStoryStart, fetchStorySummary } from "./fetchStartOfStory";
import { saveOrUpdateStory } from "../helpers/indexedDB";
import { MoralAlignment } from '../types/story';

const useFetchGameData = (setLoadingProgress: (progress: number) => void) => {
  const { state, setState } = useContext(AppContext);
  const {
    chosenCharacter,
    chosenGenre,
    chosenImage,
    apiKey,
    provider,
    storyStart,
  } = state;

  useEffect(() => {
    const fetchGameWorldAndCharacterInfo = async () => {
      if (chosenCharacter !== "" && storyStart === "") {
        const {
          characterTraits,
          characterBio,
          characterImage,
          characterGender,
        } = await fetchCharacterTraitsAndBio(
          chosenGenre,
          chosenCharacter,
          chosenImage,
          apiKey,
          provider
        );
        setState((prevState) => ({
          ...prevState,
          characterTraits,
          characterBio,
          characterImage,
          characterGender,
        }));

        const loadingProgress =
          [characterTraits, characterBio, characterImage].filter(Boolean)
            .length * 25;
        setLoadingProgress(loadingProgress);

        const { storyStart, options } = await fetchStoryStart(
          chosenGenre,
          chosenCharacter,
          characterTraits,
          characterBio,
          characterGender,
          apiKey,
          provider
        );
        const storySummary = await fetchStorySummary(
          storyStart,
          apiKey,
          provider
        );
        
        // 옵션 객체에 alignment와 traitAlignment 속성 추가
        const normalizedOptions = Object.entries(options).reduce((acc, [key, option]) => {
          acc[key] = {
            ...option,
            alignment: (option as any).alignment || 'neutral' as MoralAlignment,
            traitAlignment: (option as any).traitAlignment || undefined
          };
          return acc;
        }, {} as { [key: string]: { text: string; risk: string; alignment: MoralAlignment; traitAlignment?: string } });
        
        setState((prevState) => ({
          ...prevState,
          storyStart,
          storySummary: [storySummary],
          options: normalizedOptions, // 정규화된 옵션 사용
          isLoading: false,
          storyAndUserInputs: [storyStart],
        }));
        setLoadingProgress(100);
      }
    };

    fetchGameWorldAndCharacterInfo();
  }, [chosenCharacter, setLoadingProgress]);

  useEffect(() => {
    if (storyStart !== "") {
      // console.log("Game state:" + state);
      setState((prevState) => ({
        ...prevState,
        gameState: "playing",
      }));
      saveOrUpdateStory(state);
    }
  }, [storyStart]);
};

export default useFetchGameData;
