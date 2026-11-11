import type { AdmissionAgeBand, Importance, Stance } from './schemas';

export interface MatcherGroup {
  id: number;
  name: string;
  description: string;
  isRecruiting: boolean;
}

export interface WeightedPosition {
  groupId: number;
  stance: Stance;
  importance: Importance;
}

export interface WeightedQuestion {
  id: string;
  role: 'weighted';
  prompt: string;
  positions: WeightedPosition[];
}

export interface FilterOption {
  id: AdmissionAgeBand;
  label: string;
}

export interface FilterPosition {
  groupId: number;
  accepts: string[];
}

export interface FilterQuestion {
  id: string;
  role: 'filter';
  prompt: string;
  options: FilterOption[];
  positions: FilterPosition[];
}

export type MatcherQuestion = WeightedQuestion | FilterQuestion;

export interface GroupMatcher {
  groups: MatcherGroup[];
  questions: MatcherQuestion[];
}
