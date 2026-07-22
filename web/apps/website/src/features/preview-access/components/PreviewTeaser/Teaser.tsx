import { TeaserMasthead } from './internal/layout/TeaserMasthead';
import { TeaserRoot } from './internal/layout/TeaserRoot';
import { TeaserStage } from './internal/layout/TeaserStage';
import { TeaserWordmark } from './internal/ui/TeaserWordmark';

export const Teaser = Object.assign(TeaserRoot, {
  Masthead: TeaserMasthead,
  Stage: TeaserStage,
  Wordmark: TeaserWordmark,
});
