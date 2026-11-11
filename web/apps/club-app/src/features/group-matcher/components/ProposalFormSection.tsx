import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useStatementProposal } from '../hooks/use-statement-proposal';
import { STATEMENT_MAX_LENGTH } from '../schemas';

const SECTION_TITLE = 'Aussage vorschlagen';
const FIELD_LABEL = 'Aussage';
const SEND_LABEL = 'Vorschlagen';

interface ProposalFormSectionProps {
  groupId: number;
}

export const ProposalFormSection: FC<ProposalFormSectionProps> = ({ groupId }) => {
  const draft = useStatementProposal(groupId);

  return (
    <Stack component="form" noValidate onSubmit={draft.submit}>
      <KkFormSection title={SECTION_TITLE}>
        <KkTextField
          name="statement"
          label={FIELD_LABEL}
          value={draft.text}
          onChange={draft.onChange}
          maxLength={STATEMENT_MAX_LENGTH}
          error={draft.error !== undefined}
          helperText={draft.error}
        />
        <KkButton type="submit" loading={draft.isSending}>
          {SEND_LABEL}
        </KkButton>
      </KkFormSection>
    </Stack>
  );
};
