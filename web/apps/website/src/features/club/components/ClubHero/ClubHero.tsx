import { ClubHeroPhotoColumn } from './internal/layout/ClubHeroPhotoColumn';
import { ClubHeroRoot } from './internal/layout/ClubHeroRoot';
import { ClubHeroTextColumn } from './internal/layout/ClubHeroTextColumn';
import { ClubHeroActions } from './internal/ui/ClubHeroActions';
import { ClubHeroHeadline } from './internal/ui/ClubHeroHeadline';
import { ClubHeroIntro } from './internal/ui/ClubHeroIntro';
import { ClubHeroPhoto } from './internal/ui/ClubHeroPhoto';

export const ClubHero = Object.assign(ClubHeroRoot, {
  TextColumn: ClubHeroTextColumn,
  PhotoColumn: ClubHeroPhotoColumn,
  Headline: ClubHeroHeadline,
  Intro: ClubHeroIntro,
  Actions: ClubHeroActions,
  Photo: ClubHeroPhoto,
});
