import { KkLaneDot } from '@furria/ui/KkLaneDot';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import { useStepCardDots } from '../hooks/use-step-card-dots';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_BEND_LABEL } from '../studio-copy';

interface StepCardDotsLiveProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardDotsLive: FC<StepCardDotsLiveProps> = ({ screen, editor }) => {
  const seconds = usePlaybackSeconds(screen.playback.player);
  const dots = useStepCardDots(screen, editor, seconds).map((dot) => (
    <KkLaneDot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      name={dot.name}
      kind={dot.kind}
      selected={dot.selected}
      dimmed={dot.dimmed}
      label={dot.label}
      nameAbove={dot.nameAbove}
      onPress={dot.press}
      onMove={editor.move}
      onEnd={editor.end}
      onNudge={dot.nudge}
    />
  ));
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
