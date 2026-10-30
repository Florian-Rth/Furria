import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { useActStudioQuery, useMyActsQuery } from '@/features/acts/api';
import { useMeQuery } from '@/features/session/api';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { LAB_ORIGIN_LABEL, toActTitle } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { actCViewOf } from '../act-c-view';
import { LAB_PATH, labGroupOriginOf } from '../lab-act-c-paths';

export type ActCPageState =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'denied' }
  | { kind: 'ready'; view: ActCView };

export interface ActCPage {
  title: string;
  origin: KkScreenOrigin;
  state: ActCPageState;
}

const LAB_ORIGIN: KkScreenOrigin = { label: LAB_ORIGIN_LABEL, to: LAB_PATH };

export const useActCPage = (actId: number | null): ActCPage => {
  const [now] = useState(Date.now);
  const studio = useActStudioQuery(actId);
  const mine = useMyActsQuery();
  const me = useMeQuery();
  const viewerId = me.data?.person?.id ?? null;
  const summary = mine.data?.acts.find((act) => act.actId === actId);
  const data = studio.data;
  const group = data?.act.group ?? null;
  const origin = group === null ? LAB_ORIGIN : labGroupOriginOf(group.groupId, group.name);
  const title = toActTitle(data?.act.name);

  if (actId === null || isNotFoundError(studio.error)) {
    return { title, origin, state: { kind: 'missing' } };
  }
  if (isForbiddenError(studio.error)) {
    return { title, origin, state: { kind: 'denied' } };
  }
  if (data === undefined || mine.isPending || me.isPending) {
    return { title, origin, state: { kind: 'loading' } };
  }

  return {
    title,
    origin,
    state: { kind: 'ready', view: actCViewOf(data, summary, viewerId, now) },
  };
};
