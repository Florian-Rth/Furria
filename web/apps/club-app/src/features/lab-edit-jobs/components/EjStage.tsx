import { Stage } from '@furria/studio/Stage';
import { StudioStageReadout } from '@furria/studio/StudioStageReadout';
import { STUDIO_FRONT } from '@furria/studio/studio-copy';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import { useActStudioRoutes } from '@furria/studio/use-act-studio-routes';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useStudioStageWork } from '@furria/studio/use-studio-stage-work';
import type { KkEjStageNameSize } from '@furria/ui/KkEjStageName';
import type { FC } from 'react';
import type { EjArrange } from '../hooks/use-arrange';
import { hitEditorOf } from '../job-stage';
import { EjStageDots } from './EjStageDots';

interface EjStageProps {
  screen: StudioWorkScreen;
  editor: ActStudioStage;
  arrange: EjArrange;
  label: string;
  named: boolean;
  bigNames: boolean;
  nameSize: KkEjStageNameSize;
}

export const EjStage: FC<EjStageProps> = ({
  screen,
  editor,
  arrange,
  label,
  named,
  bigNames,
  nameSize,
}) => {
  const { stage } = screen.playback;
  const work = useStudioStageWork(screen, hitEditorOf(editor));
  const routes = useActStudioRoutes(screen, editor);
  const echoes = editor.onionPoints.map((point) => (
    <Stage.Echo key={point.key} x={point.x} y={point.y} />
  ));
  const readout = <StudioStageReadout readout={work.gestures.readout} />;
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
      overlay={readout}
    >
      <Stage.Grid lines={work.grid} />
      {echoes}
      {paths}
      {keys}
      <EjStageDots
        screen={screen}
        editor={editor}
        arrange={arrange}
        work={work}
        named={named}
        bigNames={bigNames}
        nameSize={nameSize}
      />
    </Stage>
  );
};
