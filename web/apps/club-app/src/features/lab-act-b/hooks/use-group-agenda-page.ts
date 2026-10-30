import { useState } from 'react';
import { useGroupActsQuery, useMyActsQuery } from '@/features/acts/api';
import { useGroupHubQuery } from '@/features/group-hub/api';
import { toHubMetaFacts } from '@/features/group-hub/group-hub-labels';
import { hubActsOf } from '@/features/group-hub/hub-acts';
import { toGroupTone } from '@/features/groups/group-identity';
import { toGroupKindLabel } from '@/features/groups/groups-labels';
import { parsePositiveId } from '@/lib/positive-id';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { groupHubPathOf } from '../agenda-paths';
import type { GroupAgendaAct } from '../group-agenda';
import { groupAgendaActsOf, groupStripFactsOf, soonestActIdOf } from '../group-agenda';
import type { AgendaPageStatus, AgendaStrip } from './use-agenda-act-page';

const GROUP_FALLBACK_TITLE = 'Gruppe';

export interface GroupAgendaPage {
  status: AgendaPageStatus;
  title: string;
  strip: AgendaStrip;
  acts: GroupAgendaAct[] | null;
  actsFailed: boolean;
  soonestActId: number | null;
  now: number;
  hubTo: string;
}

export const useGroupAgendaPage = (rawGroupId: string): GroupAgendaPage => {
  const groupId = parsePositiveId(rawGroupId) ?? 0;
  const hub = useGroupHubQuery(groupId === 0 ? null : groupId);
  const groupActs = useGroupActsQuery(groupId);
  const myActs = useMyActsQuery();
  const [now] = useState(Date.now);
  const group = hub.data;
  const acts =
    groupActs.data === undefined || myActs.data === undefined
      ? null
      : groupAgendaActsOf(hubActsOf(groupActs.data).current, myActs.data.acts, now);
  const kindLabel = toGroupKindLabel(group?.groupKindName ?? null);
  const facts = group === undefined ? [] : toHubMetaFacts(group);
  const statusOf = (): AgendaPageStatus => {
    if (groupId === 0 || isNotFoundError(hub.error)) {
      return 'missing';
    }
    if (isForbiddenError(hub.error)) {
      return 'denied';
    }

    return group === undefined ? 'loading' : 'ready';
  };

  return {
    status: statusOf(),
    title: group?.name ?? GROUP_FALLBACK_TITLE,
    strip: {
      title: group?.name ?? GROUP_FALLBACK_TITLE,
      icon: 'group',
      facts: groupStripFactsOf(group?.name ?? GROUP_FALLBACK_TITLE, kindLabel, facts),
      tone: group === undefined ? null : toGroupTone(group.groupId, group.tone),
    },
    acts,
    actsFailed: groupActs.error !== null,
    soonestActId: acts === null ? null : soonestActIdOf(acts),
    now,
    hubTo: groupHubPathOf(groupId),
  };
};
