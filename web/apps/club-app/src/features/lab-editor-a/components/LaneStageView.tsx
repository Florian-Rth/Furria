import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { useActStudioRoutes } from '@/features/act-studio/hooks/use-act-studio-routes';
import { STUDIO_FRONT } from '@/features/act-studio/studio-copy';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { LANE_STAGE } from '../lane-copy';
import { LaneDotsLive } from './LaneDotsLive';

interface LaneStageViewProps {
  lane: LaneEditor;
}

export const LaneStageView: FC<LaneStageViewProps> = ({ lane }) => {
  const { screen, editor } = lane;
  const { stage } = screen.playback;
  const routes = useActStudioRoutes(screen, editor);
  const aspect = stage.depthMetres / stage.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));

  return (
    <KkStudioStage
      label={LANE_STAGE}
      frontLabel={STUDIO_FRONT}
      widthMetres={stage.widthMetres}
      depthMetres={stage.depthMetres}
      artworkSvg={stage.artworkSvg}
      onClear={editor.clear}
    >
      <KkStudioStage.Onion points={editor.onionPoints} />
      {paths}
      <LaneDotsLive lane={lane} />
    </KkStudioStage>
  );
};
