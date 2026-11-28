import { canPractise } from '@furria/studio/music-timeline';
import { seesDetailsOf } from '@/features/acts/act-studio';
import type { ActScreenSearch, ActStudioResponse, CoEditor, MyAct } from '@/features/acts/schemas';
import type { ActKind, ActWish } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type { ActTemplate, Ask, DoorKey, EveningSlot, StudioCounts } from './act-card-model';
import {
  askOf,
  doorsOf,
  eveningSlotOf,
  isEditorOf,
  studioCountsOf,
  templateOf,
} from './act-card-model';
import type { ActCardLinks } from './act-card-paths';
import { actCardLinksOf } from './act-card-paths';

export interface NextEvening {
  eventId: number;
  title: string;
  startsAt: string;
  slot: EveningSlot;
}

export interface ActCardView {
  actId: number;
  name: string;
  kind: ActKind | null;
  sessionYear: number | null;
  group: { groupId: number; name: string } | null;
  template: ActTemplate;
  doors: DoorKey[];
  viewerId: number | null;
  inCast: boolean;
  editor: boolean;
  seesDetails: boolean;
  groupNamed: boolean;
  canEditStudio: boolean;
  canEditSettings: boolean;
  hasStudio: boolean;
  nextEvening: NextEvening | null;
  cast: PortraitPersonRef[];
  editors: PortraitPersonRef[];
  ask: Ask;
  playable: boolean;
  counts: StudioCounts | null;
  coEditors: CoEditor[];
  wishes: ActWish[];
  links: ActCardLinks;
}

const nextEveningOf = (summary: MyAct | undefined): NextEvening | null => {
  if (summary?.nextEvening == null) {
    return null;
  }

  const { eventId, title, startsAt, position } = summary.nextEvening;

  return { eventId, title, startsAt, slot: eveningSlotOf(position) };
};

export const actCardViewOf = (
  data: ActStudioResponse,
  summary: MyAct | undefined,
  viewerId: number | null,
  search: ActScreenSearch,
): ActCardView => {
  const { act, viewer, studio } = data;
  const template = templateOf(act.kind);
  const leads = summary?.viewerLeads ?? false;
  const editors = summary?.editors ?? [];

  return {
    actId: act.actId,
    name: act.name,
    kind: act.kind,
    sessionYear: act.sessionYear,
    group: act.group === null ? null : { groupId: act.group.groupId, name: act.group.name },
    template,
    doors: doorsOf(template, studio !== null),
    viewerId,
    inCast: viewer.inCast,
    editor: isEditorOf(viewer.canEditStudio, leads),
    seesDetails: seesDetailsOf(viewer),
    groupNamed: act.group !== null && act.group.name !== act.name,
    canEditStudio: viewer.canEditStudio,
    canEditSettings: viewer.canEditSettings,
    hasStudio: studio !== null,
    nextEvening: nextEveningOf(summary),
    cast: act.cast,
    editors,
    ask: askOf(editors, viewerId),
    playable: summary?.playable ?? canPractise(studio),
    counts: studio === null ? null : studioCountsOf(studio),
    coEditors: data.coEditors,
    wishes: act.wishes,
    links: actCardLinksOf(act.actId, search),
  };
};
