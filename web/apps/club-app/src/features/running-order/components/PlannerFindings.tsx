import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { ALL_FINE } from '../planner-copy';
import { PlannerFindingItem } from './PlannerFindingItem';
import { PlannerProposalHolds } from './PlannerProposalHolds';
import { PlannerSuggestionMoves } from './PlannerSuggestionMoves';

export const PlannerFindings: FC = () => {
  const planner = usePlanner();
  const items = planner.findings.map((finding, index) => (
    <PlannerFindingItem
      key={`${finding.kind}:${finding.lineKeys.join('|')}:${String(index)}`}
      finding={finding}
      fix={planner.findingFixes[index] ?? null}
    />
  ));
  const content =
    items.length === 0 ? (
      <KkText variant="body2" tone="secondary">
        {ALL_FINE}
      </KkText>
    ) : (
      <Stack sx={{ minWidth: 0 }}>{items}</Stack>
    );

  return (
    <>
      <PlannerSuggestionMoves />
      <PlannerProposalHolds />
      {content}
    </>
  );
};
