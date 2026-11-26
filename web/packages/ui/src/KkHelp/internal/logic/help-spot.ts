import { HELP_SPOT_ATTRIBUTE } from '../../../internal/help-spot';
import { KK_LANDING_ATTRIBUTE } from '../../../kk-landing';
import { kkTokens } from '../../../tokens';

const SHEET_EXIT_MS = 280;
const SPOT_HOLD_MS = kkTokens.motion.helpSpotSeconds * 1000;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const scrollBehaviour = (): ScrollBehavior =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth';

const markSpot = (node: Element): void => {
  node.removeAttribute(HELP_SPOT_ATTRIBUTE);
  void node.getBoundingClientRect();
  node.setAttribute(HELP_SPOT_ATTRIBUTE, '');
  window.setTimeout(() => {
    node.removeAttribute(HELP_SPOT_ATTRIBUTE);
  }, SPOT_HOLD_MS);
};

const revealSpot = (spot: string): void => {
  const node = document.querySelector(`[${KK_LANDING_ATTRIBUTE}="${CSS.escape(spot)}"]`);

  if (node === null) {
    return;
  }

  node.scrollIntoView({ behavior: scrollBehaviour(), block: 'center' });
  markSpot(node);
};

export const revealSpotAfterSheet = (spot: string): void => {
  window.setTimeout(() => {
    revealSpot(spot);
  }, SHEET_EXIT_MS);
};
