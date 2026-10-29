import type { KkIconName } from '@furria/ui/KkIcon';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { formatCountdown } from '@/lib/countdown';
import { formatIsoDay } from '@/lib/membership-labels';
import type { StudioOverview } from './act-studio';
import {
  ARCHIVED_NOTE,
  countOf,
  META_SEPARATOR,
  NONE,
  toClosedActNote,
  toSessionLabel,
} from './acts-copy';

export const ACT_FALLBACK_TITLE = 'Auftritt';
export const ACT_LOADING_LABEL = 'Auftritt wird geladen';
export const ACT_FACTS_LABEL = 'Eckdaten des Auftritts';
export const ACT_DENIED_MESSAGE =
  'Diesen Auftritt sehen seine Besetzung, die Gruppenleitung und die Ablaufplanung.';
export const SETTINGS_LABEL = 'Bearbeiten';
export const DETAILS_LABEL = 'Über den Auftritt';
export const SETTINGS_TITLE = 'Auftritt bearbeiten';
export const STUDIO_TITLE = 'Zum Üben';
export const STUDIO_FACTS_LABEL = 'Was es zum Üben gibt';
export const NO_MUSIC_TITLE = 'Noch keine Musik';
export const NO_MUSIC_LINE = 'Sobald die Musik da ist, übst du hier zu Musik, Schritten und Video.';
export const CAST_ONLY_NOTE =
  'Musik, Schritte und Videos sehen die Besetzung und die Leitung der Gruppe.';
export const CO_EDITORS_TITLE = 'Bearbeiten mit';
export const CO_EDITORS_NOTE = 'Pflegen Musik, Schritte, Videos und Aufstellung mit.';
export const CO_EDITORS_EMPTY = 'Bisher pflegt nur die Gruppenleitung.';
export const CO_EDITOR_GRANT_LABEL = 'Aus der Besetzung dazunehmen';
export const toCoEditorRevokeLabel = (name: string): string =>
  `${name} nicht mehr mitbearbeiten lassen`;

const ISO_DAY_LENGTH = 10;

export interface ActPageFact {
  key: string;
  label: string;
  value: string;
  icon: KkIconName;
}

const withAside = (value: number, aside: number, label: string): string =>
  aside === 0 ? String(value) : `${value}${META_SEPARATOR}${aside} ${label}`;

export const actFactsOf = (act: CatalogueAct): ActPageFact[] => [
  {
    key: 'kind',
    label: 'Art',
    value: act.kind === null ? 'offen' : toActKindLabel(act.kind),
    icon: 'stage',
  },
  { key: 'group', label: 'Gruppe', value: act.group?.name ?? NONE, icon: 'group' },
  {
    key: 'session',
    label: 'Session',
    value: act.sessionYear === null ? 'ohne Session' : toSessionLabel(act.sessionYear),
    icon: 'session',
  },
  {
    key: 'cast',
    label: 'Besetzung',
    value: act.cast.length === 0 ? 'niemand' : `${act.cast.length} dabei`,
    icon: 'person',
  },
];

export const studioFactsOf = (overview: StudioOverview): ActPageFact[] => {
  const ownSpot: ActPageFact[] =
    overview.ownSpot === null
      ? []
      : [{ key: 'ownSpot', label: 'Dein Platz', value: `Nr. ${overview.ownSpot}`, icon: 'pin' }];

  return [
    {
      key: 'music',
      label: overview.playsFinalTrack ? 'Musik (Endfassung)' : 'Musik',
      value: overview.hasMusic
        ? `${formatCountdown(overview.lengthSeconds)}${META_SEPARATOR}${countOf(overview.songs, 'Lied', 'Lieder')}`
        : NONE,
      icon: 'music',
    },
    ...ownSpot,
    {
      key: 'steps',
      label: 'Schritte',
      value: withAside(overview.steps, overview.stepsAdrift, 'ohne Platz'),
      icon: 'list',
    },
    { key: 'parts', label: 'Teile', value: String(overview.parts), icon: 'timeline' },
    {
      key: 'spots',
      label: 'Plätze',
      value: withAside(overview.spots, overview.spotsOpen, 'frei'),
      icon: 'group',
    },
    {
      key: 'videos',
      label: 'Videos',
      value: withAside(overview.videos, overview.videosOutdated, 'veraltet'),
      icon: 'play',
    },
  ];
};

export const toCoEditorSince = (grantedAt: string): string =>
  `seit ${formatIsoDay(grantedAt.slice(0, ISO_DAY_LENGTH))}`;

export const toActStateNote = (act: CatalogueAct): string | null => {
  if (act.closed) {
    return toClosedActNote(act.sessionYear);
  }

  return act.archived ? ARCHIVED_NOTE : null;
};
