import { ActMusicView } from '@furria/studio/ActMusicView';
import type { FC } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import type { ActMusicPage } from '../hooks/use-act-music-page';
import { useStudioScreen } from '../hooks/use-studio-screen';

interface ActMusicBodyProps {
  page: ActMusicPage;
  actId: number;
  studio: ActStudio;
}

export const ActMusicBody: FC<ActMusicBodyProps> = ({ page, actId, studio }) => {
  const screen = useStudioScreen(actId, studio, page.viewerId, page.canEdit, page.cast, {
    evening: null,
    startEditing: true,
    startHall: null,
    startTool: page.tool,
  });

  return <ActMusicView screen={screen} onTool={page.chooseTool} />;
};
