import { KkSeverityGlyph } from '@furria/ui/KkSeverityGlyph';
import { KkText } from '@furria/ui/KkText';
import type { FC } from 'react';
import { toProposalReasons } from '../planner-copy';
import type { ProposalRow } from '../planner-suggestion';

interface PlannerProposalChipsProps {
  row: ProposalRow;
}

export const PlannerProposalChips: FC<PlannerProposalChipsProps> = ({ row }) => {
  const reasons = toProposalReasons(row.fromTray, row.reasons, row.moreRoom);

  if (reasons === '') {
    return null;
  }

  return (
    <>
      <KkSeverityGlyph state="met" size="medium" />
      <KkText variant="caption" tone="secondary" component="span" sx={{ flex: 1 }}>
        {reasons}
      </KkText>
    </>
  );
};
