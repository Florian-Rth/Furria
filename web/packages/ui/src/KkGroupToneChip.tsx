import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneInkScheme, groupToneRecipes } from './internal/group-tone';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme, schemeFill } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const GROUND_LIGHT = '12%';
const GROUND_DARK = '22%';

const mix = (color: string, amount: string): string =>
  `color-mix(in srgb, ${color} ${amount}, transparent)`;

const groundScheme = (tone: KkGroupTone): KkScheme =>
  schemeFill(
    mix(groupToneRecipes[tone].fieldLight, GROUND_LIGHT),
    mix(groupToneRecipes[tone].fieldDark, GROUND_DARK),
  );

const chipPaint = (theme: Theme, tone: KkGroupTone): CSSObject =>
  applyScheme(theme, groupToneInkScheme(tone), groundScheme(tone));

interface KkGroupToneChipProps extends PropsWithChildren {
  tone: KkGroupTone;
  sx?: KkSx;
}

export const KkGroupToneChip: FC<KkGroupToneChipProps> = ({ tone, sx, children }) => (
  <Stack
    component="span"
    direction="row"
    data-kk-group-tone-chip
    sx={[
      (theme) => ({
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        gap: 0.75,
        px: 1.125,
        py: 0.5,
        borderRadius: `${kkTokens.radius.chip}px`,
        fontFamily: kkTokens.font.body,
        fontSize: kkTokens.type.chip,
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.label,
        lineHeight: 1.2,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...chipPaint(theme, tone),
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
