import { useNavigate } from '@tanstack/react-router';
import type { StudioEvening } from '@/features/acts/schemas';

export interface LaneRoutes {
  openMusic: (tool: 'music' | 'video') => void;
  openEditor: () => void;
}

export const editorPathOfA = (actId: number): string => `/lab/editor-a/${actId}`;

export const useLaneRoutes = (actId: number, evening: StudioEvening | null): LaneRoutes => {
  const navigate = useNavigate();
  const eveningId = evening?.eventId;

  return {
    openMusic: (tool) => {
      void navigate({
        to: '/lab/editor-a/$actId/musik',
        params: { actId: String(actId) },
        search: { evening: eveningId, tool },
      });
    },
    openEditor: () => {
      void navigate({
        to: '/lab/editor-a/$actId',
        params: { actId: String(actId) },
        search: { evening: eveningId },
      });
    },
  };
};
