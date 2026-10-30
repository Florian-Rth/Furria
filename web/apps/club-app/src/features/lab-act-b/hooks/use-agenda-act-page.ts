import type { KkAgendaCastName } from '@furria/ui/KkAgenda';

import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkScreenActionBar, KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { canPractise } from '@/features/acts/act-studio';
import { KIND_ICONS, toFullName } from '@/features/acts/acts-copy';
import { actPagePathOf } from '@/features/acts/acts-origin';
import { useActStudioQuery, useMyActsQuery } from '@/features/acts/api';
import type { ActStudioResponse, MyAct } from '@/features/acts/schemas';
import type { GroupTone } from '@/features/groups/group-identity';
import { toGroupTone } from '@/features/groups/group-identity';
import type { ActKind } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { START_ORIGIN } from '@/features/session/app-sections';
import { parsePositiveId } from '@/lib/positive-id';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import type { AgendaTemplate, AgendaWeek, PracticeBar } from '../act-agenda';
import {
  agendaItemsOf,
  agendaTemplateOf,
  agendaWeeksOf,
  askableNamesOf,
  practiceBarOf,
  shownAgendaOf,
} from '../act-agenda';
import {
  COMPOSE_LABEL,
  MISSING_ACT_LABEL,
  PRACTICE_LABEL,
  toActStripFacts,
  toAskLine,
} from '../agenda-copy';
import { groupAgendaPathOf } from '../agenda-paths';
import type { AgendaView } from '../schemas';

export type AgendaPageStatus = 'loading' | 'missing' | 'denied' | 'ready';

export interface AgendaStrip {
  title: string;
  icon: KkIconName;
  facts: string[];
  tone: GroupTone | null;
}

export interface AgendaActPage {
  actId: number;
  status: AgendaPageStatus;
  title: string;
  origin: KkScreenOrigin;
  strip: AgendaStrip;
  template: AgendaTemplate;
  view: AgendaView;
  canSwitch: boolean;
  weeks: AgendaWeek[];
  hidden: number;
  answers: boolean;
  showsTally: boolean;
  marksAttendance: boolean;
  cast: KkAgendaCastName[];
  bar: KkScreenActionBar | undefined;
  data: ActStudioResponse | undefined;
  viewerId: number | null;
  now: number;
  expand: () => void;
  switchView: (view: string) => void;
}

interface ActCore {
  name: string;
  kind: ActKind | null;
  sessionYear: number | null;
  group: { groupId: number; name: string; tone: GroupTone | null } | null;
}

const coreOf = (data: ActStudioResponse | undefined, mine: MyAct | null): ActCore | null =>
  data?.act ?? mine;

const statusOf = (
  query: UseQueryResult<ActStudioResponse, Error>,
  mine: MyAct | null,
  myActsSettled: boolean,
): AgendaPageStatus => {
  if (query.data !== undefined || (mine !== null && query.error !== null)) {
    return 'ready';
  }
  if (isNotFoundError(query.error)) {
    return 'missing';
  }
  if (isForbiddenError(query.error) && myActsSettled) {
    return 'denied';
  }

  return 'loading';
};

const isAgendaView = (view: string): view is AgendaView => view === 'mine' || view === 'details';

export const useAgendaActPage = (rawActId: string, view: AgendaView | undefined): AgendaActPage => {
  const actId = parsePositiveId(rawActId) ?? 0;
  const query = useActStudioQuery(actId === 0 ? null : actId);
  const myActs = useMyActsQuery();
  const me = useMeQuery();
  const navigate = useNavigate();
  const [now] = useState(Date.now);
  const [expanded, setExpanded] = useState(false);
  const viewerId = me.data?.person?.id ?? null;
  const mine = myActs.data?.acts.find((act) => act.actId === actId) ?? null;
  const data = query.data;
  const core = coreOf(data, mine);
  const template = agendaTemplateOf(core?.kind ?? null);
  const canEditStudio = data?.viewer.canEditStudio === true;
  const canSwitch = canEditStudio || data?.viewer.canEditSettings === true;
  const inCast = data?.viewer.inCast ?? mine?.viewerInCast ?? false;
  const cast = data?.act.cast ?? (mine?.cast ?? []).map((person) => ({ ...person, absent: false }));
  const items = agendaItemsOf(
    { template, studio: data?.studio ?? null, cast, myAct: mine, viewerId },
    now,
  );
  const shown = shownAgendaOf(items, now, expanded);
  const playable =
    data?.studio === undefined ? (mine?.playable ?? false) : canPractise(data.studio);
  const askable = askableNamesOf(mine?.editors ?? data?.coEditors ?? [], viewerId);
  const practice: PracticeBar = practiceBarOf({ template, playable, canEditStudio, askable });
  const goToStudio = (): void => {
    void navigate({ to: actPagePathOf(actId), search: { from: 'start' } });
  };
  const bars: Record<PracticeBar['kind'], KkScreenActionBar | undefined> = {
    none: undefined,
    play: { primary: { label: PRACTICE_LABEL, icon: 'play', onSelect: goToStudio } },
    compose: { primary: { label: COMPOSE_LABEL, icon: 'music', onSelect: goToStudio } },
    ask: {
      context: toAskLine(practice.kind === 'ask' ? practice.names : []),
      primary: { label: PRACTICE_LABEL, icon: 'play', disabled: true, onSelect: goToStudio },
    },
  };
  const group = core?.group ?? null;

  return {
    actId,
    status: actId === 0 ? 'missing' : statusOf(query, mine, myActs.data !== undefined),
    title: core?.name ?? MISSING_ACT_LABEL,
    origin:
      group === null ? START_ORIGIN : { label: group.name, to: groupAgendaPathOf(group.groupId) },
    strip: {
      title: core?.name ?? MISSING_ACT_LABEL,
      icon: KIND_ICONS[core?.kind ?? 'point'],
      facts: toActStripFacts(core?.kind ?? null, group?.name ?? null, core?.sessionYear ?? null),
      tone: group === null ? null : toGroupTone(group.groupId, group.tone),
    },
    template,
    view: canSwitch ? (view ?? 'mine') : 'mine',
    canSwitch,
    weeks: agendaWeeksOf(shown.items, now),
    hidden: shown.hidden,
    answers: inCast,
    showsTally: canSwitch || mine?.viewerLeads === true,
    marksAttendance: data?.viewer.canMarkAttendance === true,
    cast: cast.map((person) => ({
      id: person.personId,
      name: toFullName(person.firstName, person.lastName),
      own: person.personId === viewerId,
    })),
    bar: bars[practice.kind],
    data,
    viewerId,
    now,
    expand: () => {
      setExpanded(true);
    },
    switchView: (next) => {
      if (!isAgendaView(next)) {
        return;
      }
      void navigate({
        to: '.',
        search: { view: next === 'mine' ? undefined : next },
        replace: true,
        resetScroll: false,
      });
    },
  };
};
