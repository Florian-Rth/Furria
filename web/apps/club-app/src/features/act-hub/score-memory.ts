import { practiceMemoryKeyOf } from '@/features/act-practice/practice-memory';

export const rememberStep = (actId: number, personId: number | null, stepId: number): void => {
  try {
    window.localStorage.setItem(practiceMemoryKeyOf(actId, personId), String(stepId));
  } catch {
    return;
  }
};
