import { useState } from 'react';
import { StatementTextFormSchema } from '../schemas';

export interface StatementTextField {
  text: string;
  error: string | undefined;
  change: (text: string) => void;
  validate: () => string | null;
}

export const useStatementTextField = (initial: string): StatementTextField => {
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | undefined>(undefined);

  const change = (next: string): void => {
    setText(next);
    setError(undefined);
  };

  const validate = (): string | null => {
    const parsed = StatementTextFormSchema.safeParse({ text });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return null;
    }

    return parsed.data.text;
  };

  return { text, error, change, validate };
};
