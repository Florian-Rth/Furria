import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import { useNavigate } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { actScreenPathOf } from '@/features/acts/act-screens';
import type { ActScreenSearch } from '@/features/acts/schemas';
import type { ActStudioPage } from './use-act-studio-page';
import { useActStudioPage } from './use-act-studio-page';

export interface ActMusicPage extends ActStudioPage {
  tool: StudioMusicTool;
  chooseTool: (tool: StudioMusicTool) => void;
}

export const useActMusicPage = (
  rawActId: string,
  tool: StudioMusicTool,
  search: ActScreenSearch,
): ActMusicPage => {
  const navigate = useNavigate();
  const page = useActStudioPage(rawActId, search);
  const { actId } = page;

  return {
    ...page,
    tool,
    chooseTool: (chosen) => {
      if (actId !== null && chosen !== tool) {
        void navigate({
          to: actScreenPathOf(actId, { kind: chosen === 'video' ? 'videos' : 'music' }),
          search: originSearchOf(search),
          replace: true,
        });
      }
    },
  };
};
