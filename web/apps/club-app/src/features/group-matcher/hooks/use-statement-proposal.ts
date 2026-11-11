import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useProposeStatementMutation } from '../api';
import { StatementTextFormSchema } from '../schemas';

export interface StatementProposalControl {
  text: string;
  error: string | undefined;
  isSending: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useStatementProposal = (groupId: number): StatementProposalControl => {
  const propose = useProposeStatementMutation(groupId);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setText(event.target.value);
    setError(undefined);
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const parsed = StatementTextFormSchema.safeParse({ text });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }

    propose.mutate(parsed.data.text, { onSuccess: () => setText('') });
  };

  return { text, error, isSending: propose.isPending, onChange, submit };
};
