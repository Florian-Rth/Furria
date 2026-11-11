import { KkCoverageGrid } from '@furria/ui/KkCoverageGrid';
import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import type { FC } from 'react';
import {
  COVERAGE_STEP_STATES,
  toCoverageCellLabel,
  toTakingPartLabel,
  toTakingPartState,
} from '../group-matcher-hub-copy';
import type { CoverageRow } from '../statement-pool';

interface CoverageGroupRowProps {
  row: CoverageRow;
}

export const CoverageGroupRow: FC<CoverageGroupRowProps> = ({ row }) => {
  const { name, tone } = row.group;
  const dot = <KkGroupToneDot tone={tone} />;
  const partState = toTakingPartState(row.isTakingPart);
  const partLabel = toTakingPartLabel(name, row.isTakingPart);
  const cells = row.cells.map((cell, index) => {
    const state = COVERAGE_STEP_STATES[cell.state];
    const label = toCoverageCellLabel(name, index, cell.state);

    return <KkCoverageGrid.Cell key={cell.statementId} state={state} label={label} />;
  });

  return (
    <KkCoverageGrid.Row>
      <KkCoverageGrid.RowHead name={name} lead={dot} />
      <KkCoverageGrid.Cell state={partState} label={partLabel} />
      {cells}
    </KkCoverageGrid.Row>
  );
};
