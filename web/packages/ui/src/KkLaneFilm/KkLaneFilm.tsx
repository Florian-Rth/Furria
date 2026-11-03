import { KkLaneFilmBar } from './internal/layout/KkLaneFilmBar';
import { KkLaneFilmRoot } from './internal/layout/KkLaneFilmRoot';
import { KkLaneFilmCaption } from './internal/ui/KkLaneFilmCaption';
import { KkLaneFilmNote } from './internal/ui/KkLaneFilmNote';
import { KkLaneFilmVideo } from './internal/ui/KkLaneFilmVideo';

export type { KkLaneFilmSource } from './internal/ui/KkLaneFilmVideo';

export const KkLaneFilm = Object.assign(KkLaneFilmRoot, {
  Video: KkLaneFilmVideo,
  Note: KkLaneFilmNote,
  Bar: KkLaneFilmBar,
  Caption: KkLaneFilmCaption,
});
