import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { useActStudioRoutes } from '../hooks/use-act-studio-routes';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STEP_CARD_STAGE } from '../step-cards-copy';
import { STUDIO_FRONT } from '../studio-copy';
import { StepCardDotsLive } from './StepCardDotsLive';

interface StepCardStageProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardStage: FC<StepCardStageProps> = ({ screen, editor }) => {
  const { stage } = screen.playback;
  const routes = useActStudioRoutes(screen, editor);
  const aspect = stage.depthMetres / stage.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));

  return (
    <KkStudioStage
      label={STEP_CARD_STAGE}
      frontLabel={STUDIO_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      onClear={editor.clear}
    >
      <KkStudioStage.Onion points={editor.onionPoints} />
      {paths}
      <StepCardDotsLive screen={screen} editor={editor} />
    </KkStudioStage>
  );
};
