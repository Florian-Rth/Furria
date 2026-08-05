import type { MatcherAnswers } from './schemas';
import { MatcherAnswersSchema } from './schemas';

const STORAGE_KEY = 'furria.matcher.answers';

type SessionReader = Pick<Storage, 'getItem'>;
type SessionWriter = Pick<Storage, 'setItem'>;
type SessionEraser = Pick<Storage, 'removeItem'>;

const parseAnswers = (raw: string): MatcherAnswers => {
  try {
    return MatcherAnswersSchema.parse(JSON.parse(raw));
  } catch {
    return {};
  }
};

export const readAnswersFromSession = (storage: SessionReader): MatcherAnswers => {
  const raw = storage.getItem(STORAGE_KEY);

  return raw === null ? {} : parseAnswers(raw);
};

export const writeAnswersToSession = (storage: SessionWriter, answers: MatcherAnswers): void => {
  storage.setItem(STORAGE_KEY, JSON.stringify(answers));
};

export const clearAnswersInSession = (storage: SessionEraser): void => {
  storage.removeItem(STORAGE_KEY);
};
