import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { inkWash } from '../internal/ink-wash';
import { redInk } from '../internal/red-ink';
import { rowDividerTop } from '../internal/row-divider';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkPourKind } from './KkPourKindGlyph';
import { KkPourKindGlyph } from './KkPourKindGlyph';

const TIME_COLUMN = '2.75rem';
const DELTA_COLUMN = '2.5rem';

export type KkPourDeltaTone = 'in' | 'out' | 'none';

export interface KkPourJournalPerson {
  name: string;
  onSelect: () => void;
}

const rowPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    alignItems: 'center',
    gap: 1,
    minHeight: kkTokens.tapTarget,
    py: 0.5,
    px: 0.5,
    ...rowDividerTop,
    ...(selected ? { backgroundColor: inkWash(theme, '6%') } : {}),
  });

const nameButtonPaint = (theme: Theme): CSSObject => ({
  typography: 'body2',
  fontWeight: 800,
  color: 'text.primary',
  borderRadius: `${kkTokens.radius.bar}px`,
  textDecoration: 'underline',
  textDecorationColor: inkWash(theme, '28%'),
  textUnderlineOffset: '0.2em',
  flexShrink: 0,
  maxWidth: '60%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': redInk(theme) },
});

const DELTA_SIGN_COLOR: Record<KkPourDeltaTone, string> = {
  in: 'text.primary',
  out: 'text.secondary',
  none: 'text.disabled',
};

interface KkPourJournalRowProps {
  kind: KkPourKind;
  time: string;
  person: KkPourJournalPerson | null;
  text: string;
  note: string | null;
  amount: string | null;
  delta: string | null;
  deltaTone: KkPourDeltaTone;
  struck: boolean;
  selected: boolean;
  sx?: KkSx;
}

export const KkPourJournalRow: FC<KkPourJournalRowProps> = ({
  kind,
  time,
  person,
  text,
  note,
  amount,
  delta,
  deltaTone,
  struck,
  selected,
  sx,
}) => {
  const name =
    person === null ? null : (
      <ButtonBase onClick={person.onSelect} data-kk-pour-person sx={nameButtonPaint}>
        {person.name}
      </ButtonBase>
    );
  const noteLine =
    note === null ? null : (
      <Typography variant="caption" noWrap sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
        {note}
      </Typography>
    );
  const textDecoration = struck ? 'line-through' : 'none';
  const amountCell =
    amount === null ? null : (
      <Typography
        variant="body2"
        noWrap
        sx={{
          flexShrink: 0,
          textAlign: 'right',
          fontWeight: 700,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
          textDecoration,
        }}
      >
        {amount}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-pour-journal-row={kind}
      sx={[rowPaint(selected), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography
        variant="caption"
        sx={{
          width: TIME_COLUMN,
          flexShrink: 0,
          fontWeight: 700,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {time}
      </Typography>
      <KkPourKindGlyph kind={kind} />
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'baseline', columnGap: 0.75, flexWrap: 'wrap', minWidth: 0 }}
        >
          {name}
          <Typography variant="body2" sx={{ minWidth: 0, color: 'text.primary', textDecoration }}>
            {text}
          </Typography>
        </Stack>
        {noteLine}
      </Stack>
      {amountCell}
      <Typography
        variant="body2"
        sx={{
          width: DELTA_COLUMN,
          flexShrink: 0,
          textAlign: 'right',
          fontWeight: 900,
          color: DELTA_SIGN_COLOR[deltaTone],
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {delta}
      </Typography>
    </Stack>
  );
};
