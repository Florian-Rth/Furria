import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { UseQueryResult } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { eveningCastOf } from '@/features/act-studio/studio-evening';
import { useActStudioQuery } from '@/features/acts/api';
import type { ActStudioResponse, StudioEvening } from '@/features/acts/schemas';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { CastPerson } from '@/features/running-order/schemas';
import { useMeQuery } from '@/features/session/api';
import { parsePositiveId } from '@/lib/positive-id';
import { FOCUS_FALLBACK_TITLE } from '../focus-copy';
import type { FocusMusicTool } from '../schemas';

export interface FocusPage {
  actId: number | null;
  query: UseQueryResult<ActStudioResponse, Error>;
  title: string;
  origin: KkScreenOrigin;
  viewerId: number | null;
  canEdit: boolean;
  evening: StudioEvening | null;
  cast: readonly CastPerson[];
  openMusic: (tool: FocusMusicTool) => void;
  switchMusic: (tool: FocusMusicTool) => void;
}

export const useFocusPage = (rawActId: string, eveningId: number | undefined): FocusPage => {
  const actId = parsePositiveId(rawActId);
  const query = useActStudioQuery(actId);
  const me = useMeQuery();
  const navigate = useNavigate();
  const act = query.data?.act ?? null;
  const evening =
    query.data?.studio?.evenings.find((candidate) => candidate.eventId === eveningId) ?? null;

  return {
    actId,
    query,
    title: act?.name ?? FOCUS_FALLBACK_TITLE,
    origin: LAB_ORIGIN,
    viewerId: me.data?.person?.id ?? null,
    canEdit: query.data?.viewer.canEditStudio === true,
    evening,
    cast: eveningCastOf(act?.cast ?? [], evening?.appearance ?? null),
    openMusic: (tool) => {
      void navigate({
        to: '/lab/editor-c/$actId/musik',
        params: { actId: rawActId },
        search: { tool },
      });
    },
    switchMusic: (tool) => {
      void navigate({
        to: '/lab/editor-c/$actId/musik',
        params: { actId: rawActId },
        search: { tool },
        replace: true,
      });
    },
  };
};
