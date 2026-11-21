import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import {
  DECISION_SECTION,
  GROUPS_FACT,
  LABEL_FACT,
  MEMBER_FROM_FACT,
  NO_LABEL,
  STARTED_BY_FACT,
  toGroupsLine,
  toMemberFromLine,
  toStarterLine,
} from '../intake-labels';
import type { IntakeSummary } from '../schemas';
import { IntakePersonRow } from './IntakePersonRow';

interface IntakeDecisionPanelProps {
  intake: IntakeSummary;
}

export const IntakeDecisionPanel: FC<IntakeDecisionPanelProps> = ({ intake }) => {
  const memberFrom = toMemberFromLine(intake.memberFrom);
  const groups = toGroupsLine(intake);
  const label = intake.label ?? NO_LABEL;
  const starter = toStarterLine(intake);
  const personId = intake.state === 'completed' ? (intake.newcomer?.personId ?? null) : null;
  const person = personId === null ? null : <IntakePersonRow personId={personId} />;

  return (
    <KkPanelSection title={DECISION_SECTION}>
      <KkPanel>
        <KkFieldRow label={MEMBER_FROM_FACT} value={memberFrom} />
        <KkFieldRow label={GROUPS_FACT} value={groups} />
        <KkFieldRow label={LABEL_FACT} value={label} />
        <KkFieldRow label={STARTED_BY_FACT} value={starter} />
        {person}
      </KkPanel>
    </KkPanelSection>
  );
};
