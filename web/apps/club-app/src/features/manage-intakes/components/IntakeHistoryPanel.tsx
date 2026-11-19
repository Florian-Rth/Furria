import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { toHistoryLines } from '../intake-history';
import { formatInstant, HISTORY_LABELS, HISTORY_SECTION } from '../intake-labels';
import type { IntakeSummary } from '../schemas';

interface IntakeHistoryPanelProps {
  intake: IntakeSummary;
}

export const IntakeHistoryPanel: FC<IntakeHistoryPanelProps> = ({ intake }) => {
  const rows = toHistoryLines(intake).map((line) => (
    <KkFieldRow
      key={line.moment}
      label={HISTORY_LABELS[line.moment]}
      value={formatInstant(line.at)}
    />
  ));

  return (
    <KkPanelSection title={HISTORY_SECTION}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
