import type { FormEvent } from 'react';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { isPoolFull } from '../statement-pool';
import type { StatementTextField } from './use-statement-text-field';
import { useStatementTextField } from './use-statement-text-field';

export interface StatementAdditionControl {
  field: StatementTextField;
  canAdd: boolean;
  submit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useStatementAddition = (): StatementAdditionControl => {
  const { pool, operations } = useGroupMatcherHubContext();
  const field = useStatementTextField('');

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const text = field.validate();

    if (text === null) {
      return;
    }

    field.change('');
    operations.add(text, () => {
      field.change(text);
    });
  };

  return { field, canAdd: !isPoolFull(pool), submit };
};
