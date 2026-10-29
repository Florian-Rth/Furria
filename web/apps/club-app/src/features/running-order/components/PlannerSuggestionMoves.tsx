import { KkFindingLine } from '@furria/ui/KkFindingLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { SUGGESTION_TITLE, toMoveTitle, toProposalReasons } from '../planner-copy';
import { PlannerDetailSection } from './PlannerDetailSection';

export const PlannerSuggestionMoves: FC = () => {
  const planner = usePlanner();

  if (!planner.suggestion.isActive) {
    return null;
  }

  const items = planner.suggestion.rows.map((row) => {
    const text = toProposalReasons(row.fromTray, row.reasons, row.moreRoom);

    return (
      <KkFindingLine
        key={row.key}
        severity="met"
        title={toMoveTitle(planner.lineNameOf(row.key), row.from, row.to)}
        text={text}
      />
    );
  });

  return (
    <PlannerDetailSection title={SUGGESTION_TITLE}>
      <Stack sx={{ minWidth: 0 }}>{items}</Stack>
    </PlannerDetailSection>
  );
};
