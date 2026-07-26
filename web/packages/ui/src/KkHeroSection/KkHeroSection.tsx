import { KkHeroActions } from './internal/layout/KkHeroActions';
import { KkHeroAside } from './internal/layout/KkHeroAside';
import { KkHeroMain } from './internal/layout/KkHeroMain';
import { KkHeroSectionRoot } from './internal/layout/KkHeroSectionRoot';
import { KkHeroDescription } from './internal/ui/KkHeroDescription';
import { KkHeroEyebrow } from './internal/ui/KkHeroEyebrow';
import { KkHeroTitle } from './internal/ui/KkHeroTitle';

export const KkHeroSection = Object.assign(KkHeroSectionRoot, {
  Main: KkHeroMain,
  Aside: KkHeroAside,
  Eyebrow: KkHeroEyebrow,
  Title: KkHeroTitle,
  Description: KkHeroDescription,
  Actions: KkHeroActions,
});
