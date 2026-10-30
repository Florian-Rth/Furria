import { KkStudioHStage } from '@furria/ui/KkStudioHStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { stageDotsAt } from '@/features/act-practice/practice-stage';
import type { StudioH } from '../hooks/use-studio-h';
import type { StudioHStage } from '../hooks/use-studio-h-stage';
import { dotLabelOf } from '../studio-h-copy';
import type { StageShare } from '../studio-h-edits';

interface StudioHStageSceneProps {
  h: StudioH;
  editor: StudioHStage;
}

export const StudioHStageScene: FC<StudioHStageSceneProps> = ({ h, editor }) => {
  const seconds = usePlaybackSeconds(h.playback.player);
  const someSelected = editor.selected.length > 0 && !editor.formation;
  const dots = stageDotsAt(editor.scene, seconds).map((dot) => {
    const spot = editor.scene.spots.find((candidate) => candidate.spotId === dot.spotId);
    const selected = editor.selected.includes(dot.spotId);
    const press = (share: StageShare): void => {
      editor.press(dot.spotId, share);
    };

    return (
      <KkStudioHStage.Dot
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
