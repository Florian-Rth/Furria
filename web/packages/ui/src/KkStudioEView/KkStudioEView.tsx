import { KkStudioEViewControls } from './internal/layout/KkStudioEViewControls';
import { KkStudioEViewHead } from './internal/layout/KkStudioEViewHead';
import { KkStudioEViewHero } from './internal/layout/KkStudioEViewHero';
import { KkStudioEViewRoot } from './internal/layout/KkStudioEViewRoot';
import { KkStudioEViewSide } from './internal/layout/KkStudioEViewSide';
import { KkStudioEViewTitles } from './internal/layout/KkStudioEViewTitles';

export const KkStudioEView = Object.assign(KkStudioEViewRoot, {
  Head: KkStudioEViewHead,
  Titles: KkStudioEViewTitles,
  Hero: KkStudioEViewHero,
  Side: KkStudioEViewSide,
  Controls: KkStudioEViewControls,
});
