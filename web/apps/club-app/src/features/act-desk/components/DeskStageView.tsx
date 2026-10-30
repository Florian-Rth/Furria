import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { useActStudioRoutes } from '@/features/act-studio/hooks/use-act-studio-routes';
import { STUDIO_FRONT } from '@/features/act-studio/studio-copy';
import { DESK_STAGE } from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import { DeskDotsLive } from './DeskDotsLive';

interface DeskStageViewProps {
  desk: ActDesk;
}

export const DeskStageView: FC<DeskStageViewProps> = ({ desk }) => {
  const { screen, editor } = desk;
  const { stage } = screen.playback;
  const routes = useActStudioRoutes(screen, editor);
  const aspect = stage.depthMetres / stage.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));

  return (
    <KkStudioStage
      label={DESK_STAGE}
      frontLabel={STUDIO_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      onClear={editor.clear}
    >
      <KkStudioStage.Onion points={editor.onionPoints} />
      {paths}
      <DeskDotsLive desk={desk} />
    </KkStudioStage>
  );
};
