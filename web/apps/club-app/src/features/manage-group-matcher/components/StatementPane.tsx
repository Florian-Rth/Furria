import { KkButton } from '@furria/ui/KkButton';
import { KkTextArea } from '@furria/ui/KkTextArea';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import {
  DELETE_LABEL,
  HUB_TITLE,
  SAVE_LABEL,
  STATEMENT_FIELD_LABEL,
  toDeleteFacts,
  toStatementHead,
  toTallyMeta,
} from '../group-matcher-hub-copy';
import { useStatementWording } from '../hooks/use-statement-wording';
import type { PoolStatement } from '../schemas';
import { STATEMENT_MAX_LENGTH } from '../schemas';
import { isAnsweredByAll, toCoverageTally, toStatementCoverageGroups } from '../statement-pool';
import { DeleteStatementDialog } from './DeleteStatementDialog';
import { GroupMatcherPaneFrame } from './GroupMatcherPaneFrame';
import { StatementCoverageLines } from './StatementCoverageLines';

interface StatementPaneProps {
  statement: PoolStatement;
  index: number;
}

export const StatementPane: FC<StatementPaneProps> = ({ statement, index }) => {
  const { pool } = useGroupMatcherHubContext();
  const wording = useStatementWording(statement);
  const { field } = wording;
  const tally = toCoverageTally(pool, statement.statementId);
  const coverageGroups = toStatementCoverageGroups(pool, statement.statementId);
  const title = toStatementHead(index);
  const state = isAnsweredByAll(tally) ? 'done' : 'open';
  const stateLabel = toTallyMeta(tally);
  const deleteFacts = toDeleteFacts(tally);
  const hasError = field.error !== undefined;
  const isUnchanged = !wording.isChanged;
  const foot = (
    <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
      <KkButton variant="text" tone="danger" onClick={wording.askDelete}>
        {DELETE_LABEL}
      </KkButton>
      <KkButton disabled={isUnchanged} loading={wording.isSaving} onClick={wording.save}>
        {SAVE_LABEL}
      </KkButton>
    </Stack>
  );

  return (
    <GroupMatcherPaneFrame
      icon="checkCircle"
      title={title}
      context={HUB_TITLE}
      state={state}
      stateLabel={stateLabel}
      foot={foot}
    >
      <KkTextArea
        name="statement"
        label={STATEMENT_FIELD_LABEL}
        value={field.text}
        onChange={field.change}
        maxLength={STATEMENT_MAX_LENGTH}
        showCount
        error={hasError}
        helperText={field.error}
      />
      <StatementCoverageLines groups={coverageGroups} />
      <DeleteStatementDialog
        open={wording.isDeleteOpen}
        facts={deleteFacts}
        onClose={wording.keep}
        onConfirm={wording.confirmDelete}
      />
    </GroupMatcherPaneFrame>
  );
};
