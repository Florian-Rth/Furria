import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_BEND_LABEL } from '../studio-copy';
import { studioDotsAt } from '../studio-dots';
import type { StageShare } from '../studio-edits';

interface ActStudioStageSceneProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioStageScene: FC<ActStudioStageSceneProps> = ({ screen, editor }) => {
  const seconds = usePlaybackSeconds(screen.playback.player);
  const dots = studioDotsAt(editor.scene, seconds, editor.selected, !editor.formation).map(
    (dot) => {
      const press = (share: StageShare): void => {
        editor.press(dot.spotId, share);
      };

      return (
        <KkStudioStage.Dot
          key={dot.spotId}
          x={dot.x}
          y={dot.y}
          number={dot.number}
          kind={dot.kind}
          selected={dot.selected}
          dimmed={dot.dimmed}
          gliding={false}
          turn={dot.turn}
          label={dot.label}
          onPress={press}
          onMove={editor.move}
          onEnd={editor.end}
        />
      );
    },
  );

  const handles = editor.movement.handles.map((handle) => {
    const press = (): void => {
      editor.movement.bendPress(handle.spotId);
    };

    return (
      <KkStudioStage.Handle
        key={handle.spotId}
        x={handle.x}
        y={handle.y}
        label={STUDIO_BEND_LABEL}
        onPress={press}
        onMove={editor.movement.bendMove}
        onEnd={editor.movement.bendEnd}
      />
    );
  });

  return (
    <>
      {dots}
      {handles}
    </>
  );
};
