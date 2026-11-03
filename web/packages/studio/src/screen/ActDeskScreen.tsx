import { ActDeskView } from '@furria/studio/ActDeskView';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActDesk } from '@furria/studio/use-act-desk';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useActStudioTakes } from '@furria/studio/use-act-studio-takes';
import { useStudioSetup } from '@furria/studio/use-studio-setup';
import type { FC } from 'react';

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
  const music = (): void => {
    screen.openMusic('music');
  };

  return <ActDeskView desk={desk} setup={setup} history={screen.history} onMusic={music} />;
};
