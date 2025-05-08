// src/types/story.ts

export type StoryStatus = 'completed' | 'died' | 'ongoing';
export type MoralAlignment = 'moral' | 'immoral' | 'neutral';
export type ScenarioType = 
  'dilemma' | 
  'consequence' | 
  'challenge' | 
  'companion' | 
  'betrayal' | 
  'moral_choice' | 
  'standard';

export interface StoryPart {
  storySegment: string;
  newStorySummary: string;
  storyStatus: StoryStatus;
  options: { [key: string]: StoryOption };
}

export interface StoryOption {
  text: string;
  risk: string;
  alignment: MoralAlignment;
  traitAlignment?: string; // 어떤 캐릭터 특성과 일치하는지
}

export interface PlayerStats {
  moralScore: number;      // -100(immoral) to 100(moral)
  riskScore: number;       // 0 to 100
  traitConsistency: number; // 0 to 100
  creativity: number;      // 0 to 100
  successRate: number;     // 0 to 100
}

export interface StorySummary {
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