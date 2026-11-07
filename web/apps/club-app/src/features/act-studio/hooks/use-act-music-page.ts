import type { StudioMusicTool } from '@furria/studio/studio-schemas';
import { useNavigate } from '@tanstack/react-router';
import type { ActMusicSearch } from '../schemas';
import type { ActStudioPage } from './use-act-studio-page';
import { useActStudioPage } from './use-act-studio-page';

export interface ActMusicPage extends ActStudioPage {
  tool: StudioMusicTool;
  chooseTool: (tool: StudioMusicTool) => void;
}

export const useActMusicPage = (rawActId: string, search: ActMusicSearch): ActMusicPage => {
  const navigate = useNavigate();
  const page = useActStudioPage(rawActId, search);

  return {
    ...page,
    tool: search.tool ?? 'music',
    chooseTool: (tool) => {
      void navigate({
        to: '.',
        search: (previous) => ({ ...previous, tool }),
        replace: true,
      });
    },
  };
};
