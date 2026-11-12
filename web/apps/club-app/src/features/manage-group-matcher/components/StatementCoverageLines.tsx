import { KkFactLine } from '@furria/ui/KkFactLine';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { COVERAGE_GROUP_LINES, toGroupLine } from '../group-matcher-hub-copy';
import type { StatementCoverageGroups } from '../statement-pool';

interface StatementCoverageLinesProps {
  groups: StatementCoverageGroups;
}

export const StatementCoverageLines: FC<StatementCoverageLinesProps> = ({ groups }) => {
  const lines = COVERAGE_GROUP_LINES.map((line) => (
    <KkFactLine key={line.key} label={line.label} value={toGroupLine(groups[line.key])} />
  ));

  return <Stack sx={{ gap: 0.75, minWidth: 0 }}>{lines}</Stack>;
};
