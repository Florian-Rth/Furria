import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStatementList } from '@furria/ui/KkStatementList';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useStatementsSection } from '../hooks/use-statements-section';
import type { GroupMatcherPage } from '../schemas';
import { StatementStanceRow } from './StatementStanceRow';

const SECTION_TITLE = 'Aussagen';
const STANDING_FIELD_LABEL = 'Auf der Website';
const EMPTY_TITLE = 'Noch keine Aussagen';
const EMPTY_DESCRIPTION = 'Sobald der Verein Aussagen aufnimmt, stehen sie hier.';

interface StatementsSectionProps {
  groupId: number;
  page: GroupMatcherPage;
}

export const StatementsSection: FC<StatementsSectionProps> = ({ groupId, page }) => {
  const section = useStatementsSection(page);

  const rows = section.statements.map((statement) => (
    <StatementStanceRow key={statement.statementId} groupId={groupId} statement={statement} />
  ));

  const list =
    rows.length === 0 ? (
      <KkEmptyState size="panel" title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
    ) : (
      <KkStatementList label={SECTION_TITLE}>{rows}</KkStatementList>
    );

  return (
    <KkPanelSection title={SECTION_TITLE}>
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>
        <KkPanel>
          <KkFieldRow label={STANDING_FIELD_LABEL} value={section.standingLabel} />
        </KkPanel>
        <KkPanel>{list}</KkPanel>
      </Stack>
    </KkPanelSection>
  );
};
