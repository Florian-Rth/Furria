import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { ActStudioCountStrip } from '@/features/act-studio/components/ActStudioCountStrip';
import { useActStudioRoutes } from '@/features/act-studio/hooks/use-act-studio-routes';
import { EIGHTS_FRONT, EIGHTS_STAGE_LABEL } from '../eights-copy';
import type { EightsStudio } from '../hooks/use-eights-studio';
import { EightsDotsLive } from './EightsDotsLive';

interface EightsStagePanelProps {
  eights: EightsStudio;
  counts: boolean;
}

export const EightsStagePanel: FC<EightsStagePanelProps> = ({ eights, counts }) => {
  const { screen, editor } = eights;
  const { stage } = screen.playback;
  const routes = useActStudioRoutes(screen, editor);
  const aspect = stage.depthMetres / stage.widthMetres;
  const paths = routes.map((route) => (
    <KkStudioStage.Path key={route.key} route={route.route} keys={route.keys} aspect={aspect} />
  ));
  const strip =
    counts && editor.moving ? <ActStudioCountStrip screen={screen} editor={editor} /> : null;

  return (
    <>
      <KkStudioStage
        label={EIGHTS_STAGE_LABEL}
        frontLabel={EIGHTS_FRONT}
        widthMetres={stage.widthMetres}
        depthMetres={stage.depthMetres}
        artworkSvg={stage.artworkSvg}
        onClear={editor.clear}
      >
        <KkStudioStage.Onion points={editor.onionPoints} />
        {paths}
        <EightsDotsLive screen={screen} editor={editor} />
      </KkStudioStage>
      {strip}
    </>
  );
};
