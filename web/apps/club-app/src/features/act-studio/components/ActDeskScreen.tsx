import { ActDeskView } from '@furria/studio/ActDeskView';
import { useActDesk } from '@furria/studio/use-act-desk';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useActStudioTakes } from '@furria/studio/use-act-studio-takes';
import type { FC } from 'react';
import { useStudioMusicRoute } from '../hooks/use-studio-music-route';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { useStudioSetup } from '../hooks/use-studio-setup';
import { useVisitHistory } from '../hooks/use-visit-history';

interface ActDeskScreenProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActDeskScreen: FC<ActDeskScreenProps> = ({ screen, editor }) => {
  const takes = useActStudioTakes(screen);
  const desk = useActDesk(screen, editor, takes);
  const setup = useStudioSetup(screen, editor, {
    leave: () => {
      desk.chooseTab('selection');
    },
    showStep: desk.focusStep,
    showSpots: desk.focusSpots,
  });
  const history = useVisitHistory(screen.actId, screen.studio);
  const openMusic = useStudioMusicRoute(screen.actId);
  const music = (): void => {
    openMusic('music');
  };

  return <ActDeskView desk={desk} setup={setup} history={history} onMusic={music} />;
};
