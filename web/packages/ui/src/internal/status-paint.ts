import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeInk } from './scheme-paint';

export type KkStatusLevel = 'ok' | 'attention' | 'broken' | 'unknown';

const { light, dark } = kkTokens.color;

const STATUS_SCHEMES: Record<KkStatusLevel, KkScheme> = {
  ok: schemeInk(light.greenInk, dark.greenInk),
  attention: schemeInk(light.goldInk, dark.goldInk),
  broken: schemeInk(light.redInk, dark.redInk),
  unknown: schemeInk(light.faint, dark.faint),
};

export const statusInk = (theme: Theme, level: KkStatusLevel): CSSObject =>
  applyScheme(theme, STATUS_SCHEMES[level]);

export const statusTick = (theme: Theme, level: KkStatusLevel): CSSObject => ({
  ...statusInk(theme, level),
  backgroundColor: 'currentColor',
});

export const BOARD_INK = {
  ink: dark.ink,
  sub: dark.sub,
  faint: dark.faint,
  line: dark.line2,
  ok: dark.greenInk,
  attention: dark.goldInk,
  broken: dark.redInk,
  unknown: dark.faint,
} as const satisfies Record<KkStatusLevel | 'ink' | 'sub' | 'faint' | 'line', string>;
