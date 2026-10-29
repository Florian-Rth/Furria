import { KkPracticeViewControls } from './internal/layout/KkPracticeViewControls';
import { KkPracticeViewHead } from './internal/layout/KkPracticeViewHead';
import { KkPracticeViewHero } from './internal/layout/KkPracticeViewHero';
import { KkPracticeViewRoot } from './internal/layout/KkPracticeViewRoot';
import { KkPracticeViewSide } from './internal/layout/KkPracticeViewSide';
import { KkPracticeViewTitles } from './internal/layout/KkPracticeViewTitles';

export const KkPracticeView = Object.assign(KkPracticeViewRoot, {
  Head: KkPracticeViewHead,
  Titles: KkPracticeViewTitles,
  Hero: KkPracticeViewHero,
  Side: KkPracticeViewSide,
  Controls: KkPracticeViewControls,
});
