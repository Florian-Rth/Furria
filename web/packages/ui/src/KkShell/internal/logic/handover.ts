import type { KkChromeMotion } from '../../../internal/chrome-density';
import { kkTokens } from '../../../tokens';

export interface KkHandover {
  headerOpacity: number;
  headerDrift: number;
  restOpacity: number;
  titleOpacity: number;
  titleRise: number;
}

const { scrollTravel, headerDrift, titleRise } = kkTokens.shell;

const HEADER_SHARE = 0.55;

const AT_REST: KkHandover = {
  headerOpacity: 1,
  headerDrift: 0,
  restOpacity: 1,
  titleOpacity: 0,
  titleRise,
};

const HANDED_OVER: KkHandover = {
  headerOpacity: 0,
  headerDrift: -headerDrift,
  restOpacity: 0,
  titleOpacity: 1,
  titleRise: 0,
};

const ramp = (value: number, from: number, to: number): number =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);

export const handoverAt = (scrollOffset: number, motion: KkChromeMotion = 'ramped'): KkHandover => {
  if (scrollOffset <= 0) {
    return AT_REST;
  }

  if (motion === 'instant') {
    return HANDED_OVER;
  }

  const travelled = Math.min(scrollOffset / scrollTravel, 1);
  const leaving = ramp(travelled, 0, HEADER_SHARE);
  const arriving = ramp(travelled, HEADER_SHARE, 1);

  return {
    headerOpacity: 1 - leaving,
    headerDrift: -headerDrift * leaving,
    restOpacity: 1 - arriving,
    titleOpacity: arriving,
    titleRise: titleRise * (1 - arriving),
  };
};
