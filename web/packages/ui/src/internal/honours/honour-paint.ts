import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';
import { groupToneFieldPaint } from '../group-tone';
import { inkWash } from '../ink-wash';
import { applyScheme } from '../scheme-paint';
import type { ForgeChipPaint } from './honour-forge';
import type { KkEnamel, KkMetalGradient } from './honour-laps';
import type { KkAvatarFunction, KkStandingApp, KkStandingMembership } from './honour-types';

export type MetalStop = 'shadow' | 'mid' | 'highlight';

const { light, dark } = kkTokens.color;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const TRACK_WASH = '13%';
export const UNDER_OPACITY = 0.3;
export const ENAMEL_SHARE = 0.3;
export const BARE_TRACK_SHARE = 0.45;

export const metalStopPaint =
  (gradient: KkMetalGradient, stop: MetalStop) =>
  (theme: Theme): CSSObject =>
    applyScheme(theme, {
      light: { stopColor: light.metal[gradient][stop] },
      dark: { stopColor: dark.metal[gradient][stop] },
    });

const onyxOf = (theme: Theme, property: 'fill' | 'stroke' | 'backgroundColor'): CSSObject =>
  applyScheme(theme, { light: { [property]: light.onyx }, dark: { [property]: dark.onyx } });

export const enamelPaint =
  (enamel: KkEnamel) =>
  (theme: Theme): CSSObject =>
    enamel === 'red' ? { stroke: palette(theme).primary.main } : onyxOf(theme, 'stroke');

export const trackPaint = (theme: Theme): CSSObject => ({ stroke: inkWash(theme, TRACK_WASH) });

export const bareTrackPaint = (theme: Theme): CSSObject => ({ stroke: palette(theme).divider });

export const membershipPaint =
  (membership: KkStandingMembership) =>
  (theme: Theme): CSSObject => {
    switch (membership) {
      case 'running':
        return { stroke: palette(theme).success.main };
      case 'paused':
        return { stroke: palette(theme).warning.main };
      case 'none':
        return { stroke: palette(theme).text.disabled };
    }
  };

export const feeBeadPaint = (theme: Theme): CSSObject => ({ stroke: palette(theme).info.main });

export const haloPaint = (theme: Theme): CSSObject => ({ fill: palette(theme).background.paper });

export const appDotPaint =
  (app: Exclude<KkStandingApp, 'none'>) =>
  (theme: Theme): CSSObject => {
    switch (app) {
      case 'invited':
        return { fill: palette(theme).background.paper, stroke: palette(theme).warning.main };
      case 'active':
        return { fill: palette(theme).success.main };
      case 'attention':
        return { fill: palette(theme).primary.main };
    }
  };

export const sashBandPaint = (theme: Theme): CSSObject => onyxOf(theme, 'fill');

export const sashEdgePaint = (theme: Theme): CSSObject => ({ fill: palette(theme).warning.main });

export const sashInkPaint = (theme: Theme): CSSObject => ({
  color: palette(theme).warning.main,
  fill: palette(theme).warning.main,
});

const edgeOf = (color: string): string => `inset 0 0 0 1px ${color}`;

export const coinPaint =
  (entry: KkAvatarFunction) =>
  (theme: Theme): CSSObject => {
    if (entry.kind === 'board') {
      return {
        ...onyxOf(theme, 'backgroundColor'),
        color: palette(theme).warning.main,
        boxShadow: edgeOf(palette(theme).warning.main),
      };
    }
    if (entry.kind === 'admin' && entry.tone !== undefined) {
      return { ...groupToneFieldPaint(theme, entry.tone), boxShadow: 'none' };
    }

    return {
      backgroundColor: palette(theme).background.paper,
      color: palette(theme).text.primary,
      boxShadow: edgeOf(palette(theme).text.primary),
    };
  };

export const overflowCoinPaint = (theme: Theme): CSSObject => ({
  backgroundColor: palette(theme).background.default,
  color: palette(theme).text.primary,
  boxShadow: edgeOf(palette(theme).divider),
});

export const coinRimPaint = (theme: Theme): CSSObject => ({
  borderColor: palette(theme).background.paper,
});

export const coinFlagPaint = (theme: Theme): CSSObject => ({
  backgroundColor: palette(theme).text.primary,
  color: palette(theme).background.paper,
});

export const sashFlagPaint = (theme: Theme): CSSObject => ({
  ...onyxOf(theme, 'backgroundColor'),
  color: palette(theme).warning.main,
});

export const chipPaint =
  (gradient: KkMetalGradient, chip: ForgeChipPaint) =>
  (theme: Theme): CSSObject => {
    switch (chip) {
      case 'mid':
      case 'highlight':
        return applyScheme(theme, {
          light: { fill: light.metal[gradient][chip] },
          dark: { fill: dark.metal[gradient][chip] },
        });
      case 'red':
        return { fill: palette(theme).primary.main };
      case 'gold':
        return { fill: palette(theme).warning.main };
    }
  };
