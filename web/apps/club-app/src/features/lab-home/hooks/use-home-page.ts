import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { HOME_FALLBACK_TITLE } from '../home-copy';

export interface HomePage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  viewerId: number | null;
  openHall: () => void;
}

export const useHomePage = (rawActId: string): HomePage => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const navigate = useNavigate();

  return {
    actId,
    query,
    title: query.data?.act.name ?? HOME_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
    viewerId: me.data?.person?.id ?? null,
    openHall: () => {
      if (actId !== null) {
        void navigate({
          to: '/acts/$actId',
          params: { actId: String(actId) },
          search: { view: 'training' },
        });
      }
    },
  };
};
