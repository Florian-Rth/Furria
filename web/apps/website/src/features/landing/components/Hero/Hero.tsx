import { HeroPhotoColumn } from './internal/layout/HeroPhotoColumn';
import { HeroRoot } from './internal/layout/HeroRoot';
import { HeroTextColumn } from './internal/layout/HeroTextColumn';
import { HeroActions } from './internal/ui/HeroActions';
import { HeroEyebrow } from './internal/ui/HeroEyebrow';
import { HeroHeadline } from './internal/ui/HeroHeadline';
import { HeroIntro } from './internal/ui/HeroIntro';
import { HeroPhoto } from './internal/ui/HeroPhoto';
import { HeroStatRow } from './internal/ui/HeroStatRow';

export const Hero = Object.assign(HeroRoot, {
  TextColumn: HeroTextColumn,
  PhotoColumn: HeroPhotoColumn,
  Eyebrow: HeroEyebrow,
  Headline: HeroHeadline,
  Intro: HeroIntro,
  Actions: HeroActions,
  StatRow: HeroStatRow,
  Photo: HeroPhoto,
});
