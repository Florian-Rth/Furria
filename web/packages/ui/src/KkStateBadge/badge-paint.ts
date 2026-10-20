import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { redInk } from '../internal/red-ink';
import { tonePaint } from '../internal/tone';
import type { KkStepState } from '../KkStatePill/step-state';
import { kkTokens } from '../tokens';

export type KkStateBadgeSize = 'small' | 'medium' | 'large';

export const BADGE_EXTENTS: Record<KkStateBadgeSize, string> = {
  small: '1.75rem',
  medium: '2.25rem',
  large: '2.75rem',
};

export const BADGE_ICON_EXTENTS: Record<KkStateBadgeSize, string> = {
  small: '1rem',
  medium: '1.25rem',
  large: '1.5rem',
};

export const CORNER_EXTENTS: Record<KkStateBadgeSize, string> = {
  small: '0.8125rem',
  medium: '0.9375rem',
  large: '1.0625rem',
};

const CURRENT_RING = kkTokens.line.section;
const SELECTED_OFFSET = 2;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const flip = keyframes`
  from {
    transform: rotateY(90deg) scale(0.86);
  }
  to {
    transform: none;
  }
`;

export const FLIP_ANIMATION = `${flip} 360ms cubic-bezier(0.22, 0.61, 0.36, 1)`;

const hairEdge = (color: string, style: 'solid' | 'dashed' = 'solid'): CSSObject => ({
  borderWidth: kkTokens.line.hair,
  borderStyle: style,
  borderColor: color,
});

export const badgeDiscPaint = (theme: Theme, state: KkStepState): CSSObject => {
  switch (state) {
    case 'done':
      return {
        backgroundColor: palette(theme).text.primary,
        color: palette(theme).background.paper,
        ...hairEdge(palette(theme).text.primary),
      };
    case 'overdue':
      return { ...tonePaint(theme, 'gold'), ...hairEdge(palette(theme).warning.main) };
    case 'current':
      return {
        ...redInk(theme),
        backgroundColor: palette(theme).background.paper,
        borderWidth: CURRENT_RING,
        borderStyle: 'solid',
        borderColor: palette(theme).primary.main,
      };
    case 'open':
      return {
        color: palette(theme).text.secondary,
        backgroundColor: palette(theme).background.paper,
        ...hairEdge(palette(theme).text.secondary),
      };
    case 'waiting':
      return {
        color: palette(theme).text.disabled,
        backgroundColor: 'transparent',
        ...hairEdge(palette(theme).text.disabled, 'dashed'),
      };
    case 'off':
      return {
        color: palette(theme).text.disabled,
        backgroundColor: palette(theme).action.hover,
        ...hairEdge('transparent'),
      };
  }
};

export const badgeSelectedPaint = (theme: Theme, selected: boolean): CSSObject => ({
  outlineWidth: kkTokens.line.section,
  outlineStyle: 'solid',
  outlineColor: selected ? palette(theme).text.primary : 'transparent',
  outlineOffset: SELECTED_OFFSET,
  transition: 'outline-color 160ms ease-out',
});
