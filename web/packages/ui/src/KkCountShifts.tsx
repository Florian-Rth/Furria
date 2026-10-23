import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from './internal/gold-ink';
import type { KkSeverity } from './KkSeverityGlyph';
import { KkSeverityGlyph } from './KkSeverityGlyph';
import type { KkSx } from './kk-sx';

export interface KkCountShift {
  id: string;
  state: KkSeverity;
  before: number;
  after: number;
  label: string;
}

interface KkCountShiftsProps {
  label: string;
  shifts: readonly KkCountShift[];
  extra?: ReactNode;
  note?: string | null;
  sx?: KkSx;
}

const figures: CSSObject = { fontVariantNumeric: 'tabular-nums lining-nums' };

const afterInk =
  (shift: KkCountShift) =>
  (theme: Theme): CSSObject =>
    shift.after < shift.before ? { color: 'success.main' } : goldInkOf(theme);

export const KkCountShifts: FC<KkCountShiftsProps> = ({ label, shifts, extra, note, sx }) => {
  const items = shifts.map((shift) => (
    <Stack
      key={shift.id}
      component="li"
      direction="row"
      data-kk-count-shift={shift.after < shift.before ? 'better' : 'worse'}
      sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}
    >
      <KkSeverityGlyph state={shift.state} />
      <Box component="span" sx={{ ...figures, color: 'text.secondary' }}>
        {shift.before}
      </Box>
      <Box component="span" aria-hidden sx={{ color: 'text.disabled' }}>
        →
      </Box>
      <Box component="span" sx={[figures, { fontWeight: 900 }, afterInk(shift)]}>
        {shift.after}
      </Box>
      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {shift.label}
      </Box>
    </Stack>
  ));
  const extraItem =
    extra === undefined || extra === null ? null : (
      <Box component="li" sx={{ color: 'text.primary', fontWeight: 800 }}>
        {extra}
      </Box>
    );
  const noteLine =
    note === undefined || note === null ? null : (
      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {note}
      </Box>
    );

  return (
    <Stack
      data-kk-count-shifts
      sx={[
        { gap: 0.25, minWidth: 0, typography: 'caption', fontWeight: 700, lineHeight: 1.35 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        component="ul"
        direction="row"
        aria-label={label}
        sx={{ flexWrap: 'wrap', columnGap: 1.25, rowGap: 0.25, m: 0, p: 0, listStyle: 'none' }}
      >
        {items}
        {extraItem}
      </Stack>
      {noteLine}
    </Stack>
  );
};
