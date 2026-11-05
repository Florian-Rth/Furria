import { useKkNotice } from '@furria/ui/KkNotice';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useHallQuery } from '@/features/hall-plan/api';
import type { HallDetails } from '@/features/hall-plan/schemas';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { HALL_CONFLICT_MESSAGE } from '../hall-builder-copy';
import { hallBuilderOriginOf } from '../hall-builder-origin';
import type { HallBuilderSearch } from '../hall-builder-search';
import { HALL_PERMISSION_KEYS } from '../hall-permission';

export interface HallBuilderPage {
  hallId: number | null;
  query: UseQueryResult<HallDetails, Error>;
  origin: KkScreenOrigin;
  sessionKey: number;
  reloadAfterConflict: () => void;
  retry: () => void;
}

export const useHallBuilderPage = (
  rawHallId: string,
  search: HallBuilderSearch,
): HallBuilderPage => {
  const hallId = parsePositiveId(rawHallId);
  const permissions = usePermissions();
  const mayBuild = HALL_PERMISSION_KEYS.some((key) => permissions.has(key));
  const query = useHallQuery(mayBuild ? hallId : null);
  const raiseNotice = useKkNotice();
  const [sessionKey, setSessionKey] = useState(0);
  const origin = hallBuilderOriginOf({
    eventId: search.event,
    venueId: query.data?.venueId ?? null,
    venueName: query.data?.venueName ?? null,
    canOpenVenue: permissions.has(PERMISSION_KEYS.clubManage),
  });

  const reloadAfterConflict = (): void => {
    raiseNotice({ tone: 'info', message: HALL_CONFLICT_MESSAGE });
    void query.refetch().then(() => {
      setSessionKey((key) => key + 1);
    });
  };

  return {
    hallId,
    query,
    origin,
    sessionKey,
    reloadAfterConflict,
    retry: () => {
      void query.refetch();
    },
  };
};
