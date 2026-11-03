import { Stage } from '@furria/studio/Stage';
import { STUDIO_FRONT } from '@furria/studio/studio-copy';
import type { FC } from 'react';
import { useActStudioRoutes } from '../hooks/use-act-studio-routes';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { useStudioStageWork } from '../hooks/use-studio-stage-work';
import { StudioStageDotsLive } from './StudioStageDotsLive';
import { StudioStageReadout } from './StudioStageReadout';

interface StudioEditStageProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  label: string;
  onGrab?: () => void;
}

export const StudioEditStage: FC<StudioEditStageProps> = ({ screen, editor, label, onGrab }) => {
  const { stage } = screen.playback;
  const work = useStudioStageWork(screen, editor, onGrab);
  const routes = useActStudioRoutes(screen, editor);
  const echoes = editor.onionPoints.map((point) => (
    <Stage.Echo key={point.key} x={point.x} y={point.y} />
  ));
  const paths = routes.map((route) => (
    <Stage.Path key={route.key} points={route.route} kind={route.kind} />
  ));
  const keys = routes.flatMap((route) =>
    route.keys.map((point) => (
      <Stage.Key key={`${route.key}:${point.key}`} x={point.x} y={point.y} />
    )),
  );

  return (
    <Stage
      label={label}
      stage={stage}
      viewpoint="dancers"
      fit="contain"
      frame={work.gestures.frame}
      frameChange="follow"
      frontLabel={STUDIO_FRONT}
      centre
      work={work.gestures.work}
      overlay={<StudioStageReadout readout={work.gestures.readout} />}
    >
      <Stage.Grid lines={work.grid} />
      {echoes}
      {paths}
      {keys}
      <StudioStageDotsLive screen={screen} editor={editor} work={work} />
    </Stage>
  );
};
