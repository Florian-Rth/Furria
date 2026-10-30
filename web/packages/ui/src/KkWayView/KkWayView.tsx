import { KkWayViewHead } from './internal/layout/KkWayViewHead';
import { KkWayViewHero } from './internal/layout/KkWayViewHero';
import { KkWayViewKeys } from './internal/layout/KkWayViewKeys';
import { KkWayViewNote } from './internal/layout/KkWayViewNote';
import { KkWayViewRibbon } from './internal/layout/KkWayViewRibbon';
import { KkWayViewRoot } from './internal/layout/KkWayViewRoot';
import { KkWayViewSide } from './internal/layout/KkWayViewSide';

export const KkWayView = Object.assign(KkWayViewRoot, {
  Head: KkWayViewHead,
  Note: KkWayViewNote,
  Hero: KkWayViewHero,
  Ribbon: KkWayViewRibbon,
  Keys: KkWayViewKeys,
  Side: KkWayViewSide,
});
