import { useState } from 'react';
import { useClubAssistantMutation } from '../api';
import {
  FEWEST_QUESTIONS_PER_PERSON_PER_DAY,
  LARGEST_MONTHLY_BUDGET_EUROS,
  MOST_QUESTIONS_PER_PERSON_PER_DAY,
  SMALLEST_MONTHLY_BUDGET_EUROS,
} from '../assistant-limits';
import type { ClubAssistant } from '../schemas';
import {
  CLUB_ASSISTANT_BUDGET_INVALID,
  CLUB_ASSISTANT_DESCRIPTION,
  CLUB_ASSISTANT_NO_KEY,
  CLUB_ASSISTANT_QUESTIONS_INVALID,
  toClubAssistantUsage,
} from '../whatsapp-copy';

const WHOLE_NUMBER = /^\d+$/;

export interface ClubAssistantPanelControl {
  isEnabled: boolean;
  description: string;
  canSwitch: boolean;
  isSwitching: boolean;
  switchAssistant: (isEnabled: boolean) => void;
  budget: string;
  setBudget: (budget: string) => void;
  budgetError: string | undefined;
  hasBudgetError: boolean;
  questions: string;
  setQuestions: (questions: string) => void;
  questionsError: string | undefined;
  hasQuestionsError: boolean;
  usage: string;
  canSave: boolean;
  isSaving: boolean;
  save: () => void;
}

const wholeNumberWithin = (text: string, min: number, max: number): number | null => {
  const trimmed = text.trim();
  if (!WHOLE_NUMBER.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  return value >= min && value <= max ? value : null;
};

const errorWhenAbsent = (value: number | null, message: string): string | undefined =>
  value === null ? message : undefined;

export const useClubAssistantPanel = (assistant: ClubAssistant): ClubAssistantPanelControl => {
  const switching = useClubAssistantMutation();
  const saving = useClubAssistantMutation();
  const savedBudget = String(assistant.monthlyBudgetEuros);
  const savedQuestions = String(assistant.questionsPerPersonPerDay);
  const [seen, setSeen] = useState({ budget: savedBudget, questions: savedQuestions });
  const [budget, setBudget] = useState(savedBudget);
  const [questions, setQuestions] = useState(savedQuestions);

  if (seen.budget !== savedBudget || seen.questions !== savedQuestions) {
    setSeen({ budget: savedBudget, questions: savedQuestions });
    setBudget(savedBudget);
    setQuestions(savedQuestions);
  }

  const isBudgetDirty = budget !== savedBudget;
  const isQuestionsDirty = questions !== savedQuestions;
  const budgetValue = isBudgetDirty
    ? wholeNumberWithin(budget, SMALLEST_MONTHLY_BUDGET_EUROS, LARGEST_MONTHLY_BUDGET_EUROS)
    : assistant.monthlyBudgetEuros;
  const questionsValue = wholeNumberWithin(
    questions,
    FEWEST_QUESTIONS_PER_PERSON_PER_DAY,
    MOST_QUESTIONS_PER_PERSON_PER_DAY,
  );
  const isPending = switching.isPending || saving.isPending;

  return {
    isEnabled: switching.isPending ? switching.variables.isEnabled : assistant.isEnabled,
    description: assistant.isModelConfigured ? CLUB_ASSISTANT_DESCRIPTION : CLUB_ASSISTANT_NO_KEY,
    canSwitch: assistant.isModelConfigured && !isPending,
    isSwitching: switching.isPending,
    switchAssistant: (isEnabled) => {
      switching.mutate({
        isEnabled,
        monthlyBudgetEuros: assistant.monthlyBudgetEuros,
        questionsPerPersonPerDay: assistant.questionsPerPersonPerDay,
      });
    },
    budget,
    setBudget,
    budgetError: errorWhenAbsent(budgetValue, CLUB_ASSISTANT_BUDGET_INVALID),
    hasBudgetError: budgetValue === null,
    questions,
    setQuestions,
    questionsError: errorWhenAbsent(questionsValue, CLUB_ASSISTANT_QUESTIONS_INVALID),
    hasQuestionsError: questionsValue === null,
    usage: toClubAssistantUsage(assistant.usedThisMonthEuros, assistant.monthlyBudgetEuros),
    canSave:
      (isBudgetDirty || isQuestionsDirty) &&
      budgetValue !== null &&
      questionsValue !== null &&
      !isPending,
    isSaving: saving.isPending,
    save: () => {
      if (budgetValue === null || questionsValue === null) {
        return;
      }
      saving.mutate({
        isEnabled: assistant.isEnabled,
        monthlyBudgetEuros: budgetValue,
        questionsPerPersonPerDay: questionsValue,
      });
    },
  };
};
