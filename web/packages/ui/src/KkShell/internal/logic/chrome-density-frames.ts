import type { CSSObject } from '@mui/material/styles';
import { CHROME_DENSITY_PROPERTY, chromeDensityAt } from '../../../internal/chrome-density';
import { scrollKeyframesOf } from '../../../internal/scroll-linked';
import { kkTokens } from '../../../tokens';

const { scrollTravel } = kkTokens.shell;

const SCROLLED_DENSITY_PROPERTY = '--kk-chrome-scrolled-density';
const DENSITY_TURNS: readonly number[] = [0, scrollTravel];

export const SCROLLED_DENSITY_REGISTRATION: CSSObject = {
  [`@property ${SCROLLED_DENSITY_PROPERTY}`]: {
    syntax: '"<number>"',
    inherits: 'true',
    initialValue: '0',
  },
};

export const SCROLLED_DENSITY_HANDOFF: CSSObject = {
  [CHROME_DENSITY_PROPERTY]: `var(${SCROLLED_DENSITY_PROPERTY})`,
};

export const CHROME_THICKENING = scrollKeyframesOf(scrollTravel, DENSITY_TURNS, (scrollOffset) => ({
  [SCROLLED_DENSITY_PROPERTY]: chromeDensityAt(scrollOffset),
}));
