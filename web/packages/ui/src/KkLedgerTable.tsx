import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkLedgerTableColumn {
  key: string;
  label: string;
  width: string | null;
  align: 'left' | 'right';
}

export interface KkLedgerTableRow {
  key: string;
  cells: readonly ReactNode[];
  strong?: boolean;
}

interface KkLedgerTableProps {
  label: string;
  columns: readonly KkLedgerTableColumn[];
  rows: readonly KkLedgerTableRow[];
  sx?: KkSx;
}

const cellSx = (column: KkLedgerTableColumn) =>
  ({
    ...(column.width === null ? { flex: 1, minWidth: 0 } : { width: column.width, flexShrink: 0 }),
    textAlign: column.align,
  }) as const;

export const KkLedgerTable: FC<KkLedgerTableProps> = ({ label, columns, rows, sx }) => {
  const head = columns.map((column) => (
    <Box key={column.key} component="span" sx={{ ...stepLabel, ...cellSx(column) }}>
      {column.label}
    </Box>
  ));
  const body = rows.map((row) => {
    const cells = row.cells.map((cell, index) => {
      const column = columns[index];

      return column === undefined ? null : (
        <Box
          key={column.key}
          component="span"
          sx={{
            ...stepFigures,
            ...cellSx(column),
            typography: 'body2',
            fontWeight: index === 0 ? 700 : 600,
            color: index === 0 ? 'text.primary' : 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {cell}
        </Box>
      );
    });

    return (
      <Stack
        key={row.key}
        component="li"
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.5,
          minHeight: '2.5rem',
          px: 0.5,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'divider',
          fontWeight: row.strong === true ? 800 : undefined,
        }}
      >
        {cells}
      </Stack>
    );
  });

  return (
    <Stack data-kk-ledger-table sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        aria-hidden
        sx={{
          gap: 1.5,
          px: 0.5,
          pb: 0.5,
          borderBottomWidth: kkTokens.line.section,
          borderBottomStyle: 'solid',
          borderBottomColor: 'text.primary',
        }}
      >
        {head}
      </Stack>
      <Box component="ul" aria-label={label} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {body}
      </Box>
    </Stack>
  );
};
