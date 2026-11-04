import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, MouseEvent, ReactElement } from 'react';
import { focusRing } from './internal/focus-ring';
import { KkIcon } from './KkIcon';
import { KK_LEDGER_PERSON_COLUMNS } from './KkLedgerPersonRow';
import { stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkLedgerHeadCell {
  id: string;
  label: string;
  sortable: boolean;
}

export interface KkLedgerPersonHeadCells {
  name: KkLedgerHeadCell;
  count: KkLedgerHeadCell;
  amount: KkLedgerHeadCell;
  oldest: KkLedgerHeadCell;
  paid: KkLedgerHeadCell;
}

const cellPaint =
  (active: boolean) =>
  (theme: Theme): CSSObject => ({
    ...stepLabel,
    gap: 0.25,
    color: active ? 'text.primary' : 'text.secondary',
    borderRadius: `${kkTokens.radius.bar}px`,
    ...focusRing(theme),
  });

interface KkLedgerPersonHeadProps {
  label: string;
  cells: KkLedgerPersonHeadCells;
  sort: string;
  onSort: (id: string) => void;
  sx?: KkSx;
}

export const KkLedgerPersonHead: FC<KkLedgerPersonHeadProps> = ({
  label,
  cells,
  sort,
  onSort,
  sx,
}) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.dataset.kkSort;

    if (id !== undefined) {
      onSort(id);
    }
  };
  const cellOf = (cell: KkLedgerHeadCell, align: 'left' | 'right'): ReactElement => {
    const active = cell.id === sort;
    const arrow = active ? (
      <KkIcon
        name="chevron"
        sx={{ width: '0.875rem', height: '0.875rem', transform: 'rotate(90deg)' }}
      />
    ) : null;

    return cell.sortable ? (
      <ButtonBase
        data-kk-sort={cell.id}
        aria-pressed={active}
        onClick={choose}
        sx={[cellPaint(active), { justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }]}
      >
        {cell.label}
        {arrow}
      </ButtonBase>
    ) : (
      <Box component="span" sx={stepLabel}>
        {cell.label}
      </Box>
    );
  };

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-ledger-person-head
      sx={[
        {
          display: { xs: 'none', md: 'flex' },
          alignItems: 'flex-end',
          gap: 1.25,
          px: 1,
          pb: 0.75,
          borderBottomWidth: kkTokens.line.section,
          borderBottomStyle: 'solid',
          borderBottomColor: 'text.primary',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box component="span" sx={{ width: KK_LEDGER_PERSON_COLUMNS.avatar, flexShrink: 0 }} />
      <Stack sx={{ flex: 1, minWidth: 0, alignItems: 'flex-start' }}>
        {cellOf(cells.name, 'left')}
      </Stack>
      <Stack sx={{ width: KK_LEDGER_PERSON_COLUMNS.count, flexShrink: 0, alignItems: 'flex-end' }}>
        {cellOf(cells.count, 'right')}
      </Stack>
      <Stack sx={{ width: KK_LEDGER_PERSON_COLUMNS.amount, flexShrink: 0, alignItems: 'flex-end' }}>
        {cellOf(cells.amount, 'right')}
      </Stack>
      <Stack sx={{ width: KK_LEDGER_PERSON_COLUMNS.day, flexShrink: 0, alignItems: 'flex-end' }}>
        {cellOf(cells.oldest, 'right')}
      </Stack>
      <Stack sx={{ width: KK_LEDGER_PERSON_COLUMNS.count, flexShrink: 0, alignItems: 'flex-end' }}>
        {cellOf(cells.paid, 'right')}
      </Stack>
    </Stack>
  );
};
