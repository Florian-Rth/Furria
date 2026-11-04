import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { goldInkOf } from './internal/gold-ink';
import { inkWashSurface } from './internal/ink-wash';
import { KkStatePill } from './KkStatePill/KkStatePill';
import { stepFigures } from './KkStatePill/state-paint';
import type { KkStepState } from './KkStatePill/step-state';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export const KK_LEDGER_PERSON_COLUMNS = {
  avatar: '2rem',
  count: '4.5rem',
  amount: '5.5rem',
  day: '6.5rem',
} as const;

export type KkLedgerCellTone = 'ink' | 'attention' | 'quiet';

const cellInk =
  (tone: KkLedgerCellTone) =>
  (theme: Theme): CSSObject => {
    switch (tone) {
      case 'attention':
        return { ...goldInkOf(theme), fontWeight: 800 };
      case 'quiet':
        return { color: 'text.disabled' };
      case 'ink':
        return { color: 'text.primary' };
    }
  };

const rowPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    justifyContent: 'flex-start',
    textAlign: 'left',
    gap: 1.25,
    minHeight: '3.25rem',
    px: 1,
    py: 0.75,
    borderBottomWidth: kkTokens.line.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: (theme.vars ?? theme).palette.divider,
    ...(selected ? inkWashSurface(theme, '8%', '14%') : {}),
    boxShadow: selected
      ? `inset ${kkTokens.line.page}px 0 0 ${(theme.vars ?? theme).palette.text.primary}`
      : 'none',
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover': { backgroundColor: (theme.vars ?? theme).palette.action.hover },
    },
  });

const figure: CSSObject = {
  ...stepFigures,
  flexShrink: 0,
  textAlign: 'right',
  typography: 'body2',
  whiteSpace: 'nowrap',
};

const wideOnly = { display: { xs: 'none', md: 'block' } } as const;
const phoneOnly = { display: { xs: 'flex', md: 'none' } } as const;

interface KkLedgerPersonRowProps {
  initials: string;
  name: string;
  state: KkStepState;
  stateLabel: string;
  openCount: string;
  openAmount: string;
  openTone: KkLedgerCellTone;
  oldest: string;
  oldestTone: KkLedgerCellTone;
  paid: string;
  phoneMeta: string;
  phoneMetaTone: KkLedgerCellTone;
  selected: boolean;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkLedgerPersonRow: FC<KkLedgerPersonRowProps> = ({
  initials,
  name,
  state,
  stateLabel,
  openCount,
  openAmount,
  openTone,
  oldest,
  oldestTone,
  paid,
  phoneMeta,
  phoneMetaTone,
  selected,
  onSelect,
  sx,
}) => (
  <Box component="li" sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <ButtonBase
      onClick={onSelect}
      aria-pressed={selected}
      data-kk-ledger-person
      sx={rowPaint(selected)}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          ...stepFigures,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: KK_LEDGER_PERSON_COLUMNS.avatar,
          height: KK_LEDGER_PERSON_COLUMNS.avatar,
          flexShrink: 0,
          borderRadius: '50%',
          typography: 'caption',
          fontWeight: 900,
          bgcolor: 'action.selected',
        }}
      >
        {initials}
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              typography: 'body2',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </Box>
          <KkStatePill state={state} label={stateLabel} sx={{ ml: 0, flexShrink: 0 }} />
        </Stack>
        <Box
          component="span"
          sx={[
            { ...stepFigures, ...phoneOnly, typography: 'caption', whiteSpace: 'nowrap' },
            cellInk(phoneMetaTone),
          ]}
        >
          {phoneMeta}
        </Box>
      </Stack>
      <Box
        component="span"
        sx={[{ ...figure, ...wideOnly, width: KK_LEDGER_PERSON_COLUMNS.count }, cellInk(openTone)]}
      >
        {openCount}
      </Box>
      <Box
        component="span"
        sx={[
          { ...figure, width: KK_LEDGER_PERSON_COLUMNS.amount, fontWeight: 800 },
          cellInk(openTone),
        ]}
      >
        {openAmount}
      </Box>
      <Box
        component="span"
        sx={[{ ...figure, ...wideOnly, width: KK_LEDGER_PERSON_COLUMNS.day }, cellInk(oldestTone)]}
      >
        {oldest}
      </Box>
      <Box
        component="span"
        sx={{
          ...figure,
          ...wideOnly,
          width: KK_LEDGER_PERSON_COLUMNS.count,
          color: 'text.secondary',
        }}
      >
        {paid}
      </Box>
    </ButtonBase>
  </Box>
);
