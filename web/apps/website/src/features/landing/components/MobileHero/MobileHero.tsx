import { MobileHeroContent } from './internal/layout/MobileHeroContent';
import { MobileHeroRoot } from './internal/layout/MobileHeroRoot';
import { MobileHeroEyebrow } from './internal/ui/MobileHeroEyebrow';
import { MobileHeroHeadline } from './internal/ui/MobileHeroHeadline';
import { MobileHeroPhoto } from './internal/ui/MobileHeroPhoto';

export const MobileHero = Object.assign(MobileHeroRoot, {
  Content: MobileHeroContent,
  Eyebrow: MobileHeroEyebrow,
  Headline: MobileHeroHeadline,
  Photo: MobileHeroPhoto,
});
