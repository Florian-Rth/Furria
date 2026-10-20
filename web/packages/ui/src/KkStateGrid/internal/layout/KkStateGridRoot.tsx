import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { FC, PropsWithChildren } from 'react';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { STICKY_HEAD_TOP, stepLabel } from '../../../KkStatePill/state-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { STATE_GRID_COLUMNS, stateGridColumnsOf, stateGridLine } from '../state-grid-paint';

const HEAD_ICON = '1.125rem';

export interface KkStateGridColumn {
  icon: KkIconName;
  label: string;
}

interface KkStateGridRootProps extends PropsWithChildren {
  label: string;
  dateLabel: string;
  eventLabel: string;
  countLabel: string;
  columns: readonly KkStateGridColumn[];
  compact?: boolean;
  sx?: KkSx;
}

export const KkStateGridRoot: FC<KkStateGridRootProps> = ({
  label,
  dateLabel,
  eventLabel,
  countLabel,
  columns,
  compact = false,
  sx,
  children,
}) => {
  const heads = columns.map((column) =>
    compact ? (
      <Tooltip key={column.label} title={column.label} placement="top">
        <Stack
          role="columnheader"
          aria-label={column.label}
          sx={{ alignItems: 'center', color: 'text.secondary' }}
        >
          <KkIcon name={column.icon} sx={{ width: HEAD_ICON, height: HEAD_ICON }} />
        </Stack>
      </Tooltip>
    ) : (
      <Stack
        key={column.label}
        direction="row"
        role="columnheader"
        sx={{ ...stepLabel, alignItems: 'center', gap: 0.75, pl: 0.5, overflow: 'visible' }}
      >
        <KkIcon name={column.icon} sx={{ width: HEAD_ICON, height: HEAD_ICON, flexShrink: 0 }} />
        <Box component="span" sx={{ minWidth: 0 }}>
          {column.label}
        </Box>
      </Stack>
    ),
  );

  return (
    <Stack
      role="table"
      aria-label={label}
      data-kk-state-grid
      sx={[
        {
          minWidth: 0,
          [STATE_GRID_COLUMNS]: stateGridColumnsOf(columns.length, compact),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        role="row"
        sx={{
          ...stateGridLine,
          position: 'sticky',
          top: STICKY_HEAD_TOP,
          zIndex: 2,
          alignItems: 'center',
          px: 1.5,
          py: 1,
          bgcolor: 'background.default',
          borderBottomWidth: kkTokens.line.section,
          borderBottomStyle: 'solid',
          borderBottomColor: 'text.primary',
        }}
      >
        <Box component="span" role="columnheader" sx={stepLabel}>
          {dateLabel}
        </Box>
        <Box component="span" role="columnheader" sx={stepLabel}>
          {eventLabel}
        </Box>
        <Box component="span" role="columnheader" sx={{ ...stepLabel, textAlign: 'right' }}>
          {countLabel}
        </Box>
        {heads}
      </Box>
      <Stack role="rowgroup" sx={{ minWidth: 0 }}>
        {children}
      </Stack>
    </Stack>
  );
};
