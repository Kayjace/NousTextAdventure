// src/AppContext.tsx
import React, { createContext, useState, ReactNode } from "react";
import { MoralAlignment, ScenarioType, PlayerStats } from "./types/story";

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

interface AppState {
  gameState: string;
  genres: string[];
  characters: { [key: string]: string[] };
  chosenGenre: string;
  chosenCharacter: string;
  characterTraits: string[];
  characterBio: string;
  characterGender: string;
  chosenImage: string;
  characterList: string;
  storyStart: string;
  storySummary: string[];
  options: { [key: string]: { text: string; risk: string; alignment: MoralAlignment; traitAlignment?: string } };
  input: string;
  storySoFar: string[];
  storyAndUserInputs: string[];
  loadingProgress: number;
  turnCount: number;
  isLoading: boolean;
  isFinal: boolean;
  apiKey: string;
  provider: string;
  nextPartOfStory: string;
  previousParagraph: string;
  tempOptions: { [key: string]: { text: string; risk: string; alignment: MoralAlignment; traitAlignment?: string } };
  charactersList: string;
  wrapUpParagraph: string;
  bigMoment: string;
  frequentActivity: string;
  characterTraitHighlight: string;
  themeExploration: string;
  // 새로운 필드들
  playerStats: PlayerStats;
  scenarioHistory: ScenarioType[];
  moralChoices: MoralAlignment[];
  successfulChoices: string[];
  overallScore: number;
  scoreBreakdown: {
    decisions: number;
    consistency: number;
    creativity: number;
    morality: number;
  };
  endingType: string;
}

const AppContext = createContext<AppContextType>({
  state: {
    gameState: "apiKeyInput",
    genres: [],
    characters: {},
    chosenGenre: "",
    chosenCharacter: "",
    characterTraits: [],
    characterBio: "",
    characterGender: "",
    chosenImage: "",
    characterList: "",
    storyStart: "",
    storySummary: [],
    options: {},
    input: "",
    storySoFar: [],
    storyAndUserInputs: [],
    loadingProgress: 0,
    turnCount: 0,
    isLoading: false,
    isFinal: false,
    apiKey: "",
    provider: "nous",
    nextPartOfStory: "",
    previousParagraph: "",
    tempOptions: {},
    charactersList: "",
    wrapUpParagraph: "",
    bigMoment: "",
    frequentActivity: "",
    characterTraitHighlight: "",
    themeExploration: "",
    // 새로운 필드들 초기값
    playerStats: {
      moralScore: 0,
      riskScore: 0,
      traitConsistency: 0,
      creativity: 0,
      successRate: 0
    },
    scenarioHistory: [],
    moralChoices: [],
    successfulChoices: [],
    overallScore: 0,
    scoreBreakdown: {
      decisions: 0,
      consistency: 0,
      creativity: 0,
      morality: 0
    },
    endingType: ""
  },
  setState: () => {},
});

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    gameState: "apiKeyInput",
    genres: [],
    characters: {},
    chosenGenre: "",
    chosenCharacter: "",
    characterTraits: [],
    characterBio: "",
    characterGender: "",
    chosenImage: "",
    characterList: "",
    storyStart: "",
    storySummary: [],
    options: {},
    input: "",
    storySoFar: [],
    storyAndUserInputs: [],
    loadingProgress: 0,
    turnCount: 0,
    isLoading: false,
    isFinal: false,
    apiKey: "",
    provider: "nous",
    nextPartOfStory: "",
    previousParagraph: "",
    tempOptions: {},
    charactersList: "",
    wrapUpParagraph: "",
    bigMoment: "",
    frequentActivity: "",
    characterTraitHighlight: "",
    themeExploration: "",
    // 새로운 필드들 초기값
    playerStats: {
      moralScore: 0,
      riskScore: 0,
      traitConsistency: 0,
      creativity: 0,
      successRate: 0
    },
    scenarioHistory: [],
    moralChoices: [],
    successfulChoices: [],
    overallScore: 0,
    scoreBreakdown: {
      decisions: 0,
      consistency: 0,
      creativity: 0,
      morality: 0
    },
    endingType: ""
  });
  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
