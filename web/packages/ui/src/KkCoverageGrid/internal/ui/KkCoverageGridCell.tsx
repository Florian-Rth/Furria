import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { FC } from 'react';
import { KkStateMark } from '../../../KkStatePill/KkStateMark';
import type { KkStepState } from '../../../KkStatePill/step-state';
import { kkTokens } from '../../../tokens';

interface KkCoverageGridCellProps {
  state: KkStepState;
  label: string;
}

export const KkCoverageGridCell: FC<KkCoverageGridCellProps> = ({ state, label }) => (
  <Tooltip title={label} placement="top">
    <Stack
      role="cell"
      aria-label={label}
      data-kk-coverage-grid-cell={state}
      sx={{ alignItems: 'center', justifyContent: 'center', minHeight: kkTokens.tapTarget }}
    >
      <KkStateMark state={state} />
    </Stack>
  </Tooltip>
);
