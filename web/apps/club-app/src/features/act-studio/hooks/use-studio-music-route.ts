import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { actScreenPathOf } from '@/features/acts/act-screens';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

export const useStudioMusicRoute = (actId: number): ((tool: StudioMusicTool) => void) => {
  const navigate = useNavigate();
  const search = ActScreenSearchSchema.parse(useSearch({ strict: false }));

  return (tool) => {
    void navigate({
      to: actScreenPathOf(actId, { kind: tool === 'video' ? 'videos' : 'music' }),
      search: originSearchOf(search),
    });
  };
};
