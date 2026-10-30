import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { KkIcon } from '../../../KkIcon';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';
import {
  PASS_EYEBROW,
  PASS_REDUCED_MOTION,
  PASS_ROLL_DELAY_MS,
  PASS_ROLL_MS,
  PASS_TABULAR,
  passFocus,
  passRedInk,
  passRoll,
} from '../pass-paint';

const NUMBER_MIN_WIDTH = '4.5rem';

const numberBlockPaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  minWidth: NUMBER_MIN_WIDTH,
  alignItems: 'flex-start',
  '& [data-kk-pass-slot-mark]': passRedInk(theme),
});

const NUMBER_MARK: CSSObject = {
  fontFamily: kkTokens.font.display,
  fontWeight: kkTokens.font.displayWeight,
  letterSpacing: kkTokens.type.tracking.display,
  textTransform: 'uppercase',
  lineHeight: 1,
};

const NUMBER_WINDOW: CSSObject = {
  display: 'block',
  clipPath: 'inset(0 -0.5em 0 -0.5em)',
};

const NUMBER_PAINT: CSSObject = {
  ...PASS_TABULAR,
  display: 'block',
  lineHeight: 1,
  letterSpacing: kkTokens.type.tracking.tight,
  animation: `${passRoll} ${PASS_ROLL_MS}ms cubic-bezier(0.2, 0.9, 0.3, 1.2) ${PASS_ROLL_DELAY_MS}ms both`,
  [PASS_REDUCED_MOTION]: { animation: 'none' },
};

const PENDING_PAINT: CSSObject = {
  color: 'text.secondary',
  lineHeight: 1.1,
  pt: 0.5,
};

const TIME_PAINT: CSSObject = {
  ...PASS_TABULAR,
  m: 0,
  lineHeight: 1.05,
  letterSpacing: kkTokens.type.tracking.display,
};

const TEXT_COLUMN: CSSObject = { minWidth: 0, flex: '1 1 12rem', gap: 0.25 };
const TITLE_PAINT: CSSObject = { ...lineClamp(3), m: 0, fontWeight: 800, lineHeight: 1.25 };
const WHEN_PAINT: CSSObject = { m: 0, color: 'text.secondary', fontWeight: 600 };

const reachPaint = (theme: Theme): CSSObject => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 1.5,
  minWidth: 0,
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...passFocus(theme),
  '& [data-kk-pass-slot-chevron]': { color: 'text.secondary', flexShrink: 0 },
  '@media (hover: hover)': {
    '&:hover [data-kk-pass-slot-title], &:hover [data-kk-pass-slot-chevron]': passRedInk(theme),
  },
});

interface KkPassCardSlotProps {
  eyebrow: string;
  numberLabel: string;
  number: string | null;
  pendingLabel: string;
  time: string | null;
  title: string;
  when: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const KkPassCardSlot: FC<KkPassCardSlotProps> = ({
  eyebrow,
  numberLabel,
  number,
  pendingLabel,
  time,
  title,
  when,
  component,
  to,
  params,
  search,
}) => {
  const figure =
    number === null ? (
      <Typography component="span" variant="h4" sx={PENDING_PAINT}>
        {pendingLabel}
      </Typography>
    ) : (
      <>
        <Typography component="span" variant="caption" data-kk-pass-slot-mark sx={NUMBER_MARK}>
          {numberLabel}
        </Typography>
        <Box component="span" sx={NUMBER_WINDOW}>
          <Typography component="span" variant="display" data-kk-pass-slot-number sx={NUMBER_PAINT}>
            {number}
          </Typography>
        </Box>
      </>
    );
  const timeLine =
    time === null ? null : (
      <Typography component="span" variant="h2" sx={TIME_PAINT}>
        {time}
      </Typography>
    );
  const chevron =
    component === undefined ? null : (
      <Box component="span" aria-hidden data-kk-pass-slot-chevron sx={{ display: 'inline-flex' }}>
        <KkIcon name="chevron" size="small" />
      </Box>
    );
  const reach = component ?? 'div';
  const routeProps = component === undefined ? {} : { to, params, search };

  return (
    <Stack data-kk-pass-part data-kk-pass-slot sx={{ gap: 0.75, minWidth: 0 }}>
      <Typography component="p" sx={PASS_EYEBROW}>
        {eyebrow}
      </Typography>
      <Box component={reach} {...routeProps} sx={reachPaint}>
        <Stack sx={numberBlockPaint}>{figure}</Stack>
        <Stack sx={TEXT_COLUMN}>
          {timeLine}
          <Typography component="span" variant="body2" data-kk-pass-slot-title sx={TITLE_PAINT}>
            {title}
          </Typography>
          <Typography component="span" variant="caption" sx={WHEN_PAINT}>
            {when}
          </Typography>
        </Stack>
        {chevron}
      </Box>
    </Stack>
  );
};
