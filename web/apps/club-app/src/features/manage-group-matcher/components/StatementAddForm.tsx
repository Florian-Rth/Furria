import { KkButton } from '@furria/ui/KkButton';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import { ADD_LABEL, NEW_STATEMENT_LABEL } from '../group-matcher-hub-copy';
import { useStatementAddition } from '../hooks/use-statement-addition';
import { STATEMENT_MAX_LENGTH } from '../schemas';

export const StatementAddForm: FC = () => {
  const addition = useStatementAddition();
  const { field } = addition;

  if (!addition.canAdd) {
    return null;
  }

  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    field.change(event.target.value);
  };
  const hasError = field.error !== undefined;

  return (
    <Stack
      component="form"
      direction="row"
      noValidate
      onSubmit={addition.submit}
      sx={{ gap: 1, alignItems: 'flex-start' }}
    >
      <KkTextField
        name="statement"
        label={NEW_STATEMENT_LABEL}
        value={field.text}
        onChange={change}
        maxLength={STATEMENT_MAX_LENGTH}
        error={hasError}
        helperText={field.error}
        sx={{ flex: 1, minWidth: 0 }}
      />
      <KkButton type="submit">{ADD_LABEL}</KkButton>
    </Stack>
  );
};
