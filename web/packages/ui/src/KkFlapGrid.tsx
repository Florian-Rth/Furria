import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkFlapCountTone } from './KkFlapCount';
import { KkFlapCount } from './KkFlapCount';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkFlapGridColumn {
  key: string;
  label: string;
}

export interface KkFlapGridCell {
  key: string;
  value: string;
  tone?: KkFlapCountTone;
}

export interface KkFlapGridRow {
  key: string;
  label: string;
  cells: readonly KkFlapGridCell[];
}

const headPaint = (theme: Theme): CSSObject => ({
  ...theme.typography.caption,
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.label,
  textTransform: 'uppercase',
  color: 'text.disabled',
  textAlign: 'right',
  whiteSpace: 'nowrap',
});

const rowLabelPaint = (theme: Theme): CSSObject => ({
  ...theme.typography.body2,
  fontWeight: 800,
  color: 'text.secondary',
  textAlign: 'left',
  whiteSpace: 'nowrap',
});

const cellRule: CSSObject = {
  borderTopWidth: kkTokens.line.hair,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
  py: 0.75,
};

const MILLISECONDS = 1000;

const cellDelayOf = (order: number): number =>
  (order * kkTokens.motion.flap.staggerMs) / MILLISECONDS;

interface KkFlapGridProps {
  label: string;
  columns: readonly KkFlapGridColumn[];
  rows: readonly KkFlapGridRow[];
  sx?: KkSx;
}

export const KkFlapGrid: FC<KkFlapGridProps> = ({ label, columns, rows, sx }) => {
  const head = columns.map((column) => (
    <Typography key={column.key} component="th" scope="col" sx={headPaint}>
      {column.label}
    </Typography>
  ));
  const body = rows.map((row, rowOrder) => {
    const cells = row.cells.map((cell, cellOrder) => (
      <Box component="td" key={cell.key} sx={{ ...cellRule, textAlign: 'right' }}>
        <KkFlapCount
          value={cell.value}
          variant="h3"
          tone={cell.tone}
          delaySeconds={cellDelayOf(rowOrder * columns.length + cellOrder)}
        />
      </Box>
    ));

    return (
      <Box component="tr" key={row.key}>
        <Typography component="th" scope="row" sx={[rowLabelPaint, cellRule]}>
          {row.label}
        </Typography>
        {cells}
      </Box>
    );
  });

  return (
    <Box
      component="table"
      aria-label={label}
      data-kk-flap-grid
      sx={[
        { width: '100%', borderCollapse: 'collapse', borderSpacing: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <thead>
        <tr>
          <Box component="td" />
          {head}
        </tr>
      </thead>
      <tbody>{body}</tbody>
    </Box>
  );
};
