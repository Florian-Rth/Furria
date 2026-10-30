import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useNavigate } from '@tanstack/react-router';
import { EIGHTS_EDIT_ORIGIN } from '../eights-copy';

export type EightsMusicTab = 'music' | 'video';

export interface EightsRoutes {
  openMusic: (tab: EightsMusicTab) => void;
  editorOrigin: KkScreenOrigin;
}

export const useEightsRoutes = (actId: number, eveningId: number | null): EightsRoutes => {
  const navigate = useNavigate();
  const evening = eveningId ?? undefined;

  return {
    openMusic: (tab) => {
      void navigate({
        to: '/lab/editor-b/$actId/musik',
        params: { actId: String(actId) },
        search: { evening, tab },
      });
    },
    editorOrigin: {
      label: EIGHTS_EDIT_ORIGIN,
      to: '/lab/editor-b/$actId',
      params: { actId: String(actId) },
      search: eveningId === null ? undefined : { evening: String(eveningId) },
    },
  };
};
