import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { stageDotsAt } from '@/features/act-practice/practice-stage';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { dotLabelOf } from '../studio-copy';
import type { StageShare } from '../studio-edits';

interface ActStudioStageSceneProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const ActStudioStageScene: FC<ActStudioStageSceneProps> = ({ screen, editor }) => {
  const seconds = usePlaybackSeconds(screen.playback.player);
  const someSelected = editor.selected.length > 0 && !editor.formation;
  const dots = stageDotsAt(editor.scene, seconds).map((dot) => {
    const spot = editor.scene.spots.find((candidate) => candidate.spotId === dot.spotId);
    const selected = editor.selected.includes(dot.spotId);
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
        selected={selected}
        dimmed={someSelected && !selected}
        gliding={false}
        label={dotLabelOf(dot.number, spot?.person?.firstName ?? null)}
        onPress={press}
        onMove={editor.move}
        onEnd={editor.end}
      />
    );
  });

  return <>{dots}</>;
};
