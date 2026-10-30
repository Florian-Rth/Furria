import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useIsWideScreen } from '@furria/ui/use-is-wide-screen';
import { useState } from 'react';
import { useActStudioQuery, useMyActsQuery } from '@/features/acts/api';
import type { ActStudioResponse, MyAct } from '@/features/acts/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { canOpenDetails, passActOf } from '../pass-act';
import { ACT_FALLBACK_TITLE } from '../pass-copy';
import { passActOriginOf } from '../pass-paths';

export type PassActPageStatus = 'loading' | 'ready' | 'notFound' | 'forbidden' | 'failed';

export interface PassActPage {
  status: PassActPageStatus;
  act: MyAct | null;
  studio: ActStudioResponse | undefined;
  viewerId: number | null;
  title: string;
  origin: KkScreenOrigin;
  canDetails: boolean;
  isDetailsOpen: boolean;
  isWide: boolean;
  retrying: boolean;
  retry: () => void;
  openDetails: () => void;
  closeDetails: () => void;
}

const statusOf = (
  actId: number | null,
  act: MyAct | null,
  error: Error | null,
  settled: boolean,
): PassActPageStatus => {
  if (actId === null || isNotFoundError(error)) {
    return 'notFound';
  }
  if (act !== null) {
    return 'ready';
  }
  if (isForbiddenError(error)) {
    return 'forbidden';
  }

  return settled ? 'failed' : 'loading';
};

export const usePassActPage = (rawActId: string): PassActPage => {
  const actId = parsePositiveId(rawActId);
  const mine = useMyActsQuery();
  const studio = useActStudioQuery(actId);
  const me = useMeQuery();
  const isWide = useIsWideScreen();
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const viewerId = me.data?.person?.id ?? null;
  const act = passActOf(actId, mine.data?.acts, studio.data, viewerId);
  const settled = !mine.isPending && !studio.isPending;
  const canEditStudio = studio.data?.viewer.canEditStudio === true;

  return {
    status: statusOf(actId, act, studio.error, settled),
    act,
    studio: studio.data,
    viewerId,
    title: act?.name ?? ACT_FALLBACK_TITLE,
    origin: passActOriginOf(act?.group ?? null),
    canDetails: act !== null && canOpenDetails(act, viewerId, canEditStudio),
    isDetailsOpen,
    isWide,
    retrying: mine.isFetching || studio.isFetching,
    retry: () => {
      void mine.refetch();
      void studio.refetch();
    },
    openDetails: () => {
      setDetailsOpen(true);
    },
    closeDetails: () => {
      setDetailsOpen(false);
    },
  };
};
