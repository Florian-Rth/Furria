import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import { useNavigate } from '@tanstack/react-router';

export const useStudioMusicRoute = (actId: number): ((tool: StudioMusicTool) => void) => {
  const navigate = useNavigate();

  return (tool) => {
    void navigate({
      from: '/acts/$actId',
      to: '/acts/$actId/musik',
      params: { actId: String(actId) },
      search: (previous) => ({ ...previous, tool }),
    });
  };
};
