import type { KkIconName } from '@furria/ui/KkIcon';
import { toWishChipLabel } from '@/features/acts/acts-copy';
import {
  EDITORS_TITLE,
  MUSIC_TITLE,
  NONE,
  SESSION_TITLE,
  SETTINGS_OPEN,
  SPOTS_TITLE,
  STEPS_TITLE,
  STUDIO_OPEN,
  toCountLine,
  toEveningsAside,
  toMusicFigure,
  toMusicSource,
  toSessionLine,
  toSpotsMeta,
  toStepsMeta,
  toVideosMeta,
  VIDEOS_TITLE,
  WISHES_TITLE,
} from './act-card-copy';
import type { CardLink } from './act-card-paths';
import type { ActCardView } from './act-card-view';

export type DetailTone = 'ink' | 'muted' | 'attention';

export interface DetailTile {
  key: string;
  icon: KkIconName;
  label: string;
  value: string;
  aside?: string;
  tone: DetailTone;
  lines: string[];
  link: CardLink | null;
  hint: string;
}

const DASH = '–';

const countTone = (count: number): DetailTone => (count === 0 ? 'muted' : 'ink');

const studioTilesOf = (view: ActCardView): DetailTile[] => {
  const counts = view.counts;

  if (counts === null || view.template !== 'studio') {
    return [];
  }

  const studio = view.canEditStudio ? view.links.edit : null;
  const hasMusic = counts.musicSeconds > 0;

  return [
    {
      key: 'music',
      icon: 'music',
      label: MUSIC_TITLE,
      value: hasMusic ? toMusicFigure(counts.musicSeconds) : DASH,
      tone: hasMusic ? 'ink' : 'attention',
      lines: hasMusic ? [toMusicSource(counts)] : [NONE],
      link: studio,
      hint: STUDIO_OPEN,
    },
    {
      key: 'steps',
      icon: 'list',
      label: STEPS_TITLE,
      value: counts.steps === 0 ? DASH : String(counts.steps),
      tone: countTone(counts.steps),
      lines: counts.steps === 0 ? [NONE] : [toStepsMeta(counts)],
      link: studio,
      hint: STUDIO_OPEN,
    },
    {
      key: 'spots',
      icon: 'pin',
      label: SPOTS_TITLE,
      value: counts.spots === 0 ? DASH : String(counts.spots),
      tone: counts.openSpots > 0 ? 'attention' : countTone(counts.spots),
      lines: counts.spots === 0 ? [NONE] : [toSpotsMeta(counts)],
      link: studio,
      hint: STUDIO_OPEN,
    },
    {
      key: 'videos',
      icon: 'image',
      label: VIDEOS_TITLE,
      value: counts.videos === 0 ? DASH : String(counts.videos),
      tone: countTone(counts.videos),
      lines: counts.videos === 0 ? [NONE] : [toVideosMeta(counts)],
      link: studio,
      hint: STUDIO_OPEN,
    },
  ];
};

const peopleTileOf = (view: ActCardView): DetailTile => ({
  key: 'editors',
  icon: 'handshake',
  label: EDITORS_TITLE,
  value: view.coEditors.length === 0 ? DASH : String(view.coEditors.length),
  tone: countTone(view.coEditors.length),
  lines:
    view.coEditors.length === 0
      ? [NONE]
      : [view.coEditors.map((editor) => editor.firstName).join(', ')],
  link: null,
  hint: '',
});

const wishesTileOf = (view: ActCardView): DetailTile => ({
  key: 'wishes',
  icon: 'wish',
  label: WISHES_TITLE,
  value: view.wishes.length === 0 ? DASH : String(view.wishes.length),
  tone: countTone(view.wishes.length),
  lines:
    view.wishes.length === 0
      ? [NONE]
      : view.wishes.map((wish) => toWishChipLabel(wish.kind, wish.strength)),
  link: view.canEditSettings ? view.links.settings : null,
  hint: SETTINGS_OPEN,
});

const sessionTileOf = (view: ActCardView): DetailTile => {
  const joined = view.evenings.filter((evening) => evening.appearance !== null).length;

  return {
    key: 'session',
    icon: 'session',
    label: SESSION_TITLE,
    value: String(joined),
    aside: toEveningsAside(joined),
    tone: countTone(joined),
    lines: [
      ...(view.sessionYear === null ? [] : [toSessionLine(view.sessionYear)]),
      toCountLine(view.trainings.length, 'Training', 'Trainings'),
    ],
    link: null,
    hint: '',
  };
};

export const detailTilesOf = (view: ActCardView): DetailTile[] =>
  view.hasStudio
    ? [...studioTilesOf(view), peopleTileOf(view), wishesTileOf(view), sessionTileOf(view)]
    : [wishesTileOf(view)];
