import { format, isValid, parseISO } from 'date-fns';
import type { KkFieldChoice } from './field-choice';
import { EMPTY_CHOICE_ID } from './field-choice';

export interface KkDateQuickChoice {
  label: string;
  value: string | null;
}

const ISO_DAY_FORMAT = 'yyyy-MM-dd';

export const parseIsoDate = (value: string | null): Date | null => {
  if (value === null || value === '') {
    return null;
  }

  const parsed = parseISO(value);

  if (!isValid(parsed)) {
    return null;
  }

  return parsed;
};

export const toIsoDate = (value: Date | null): string | null => {
  if (value === null || !isValid(value)) {
    return null;
  }

  return format(value, ISO_DAY_FORMAT);
};

export interface KkDateChange {
  isPublishable: boolean;
  value: string | null;
}

export const readDateChange = (date: Date | null, allowEmpty: boolean): KkDateChange => {
  if (date === null) {
    return { isPublishable: allowEmpty, value: null };
  }

  const value = toIsoDate(date);

  if (value === null) {
    return { isPublishable: false, value: null };
  }

  return { isPublishable: true, value };
};

export const dateChoiceId = (value: string | null): string => value ?? EMPTY_CHOICE_ID;

export const resolveDateChoiceId = (id: string): string | null => {
  if (id === EMPTY_CHOICE_ID) {
    return null;
  }

  return id;
};

export const buildDateChoices = (
  quickChoices: readonly KkDateQuickChoice[],
  emptyLabel: string | null,
): readonly KkFieldChoice[] => {
  const choices: KkFieldChoice[] =
    emptyLabel === null ? [] : [{ id: EMPTY_CHOICE_ID, label: emptyLabel }];

  for (const quickChoice of quickChoices) {
    const id = dateChoiceId(quickChoice.value);
    const isKnown = choices.some((choice) => choice.id === id);

    if (!isKnown) {
      choices.push({ id, label: quickChoice.label });
    }
  }

  return choices;
};
