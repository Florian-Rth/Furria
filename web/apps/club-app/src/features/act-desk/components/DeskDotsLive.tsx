import { KkLaneDot } from '@furria/ui/KkLaneDot';
import { KkStudioStage } from '@furria/ui/KkStudioStage';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { STUDIO_BEND_LABEL } from '@/features/act-studio/studio-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import { useDeskDots } from '../hooks/use-desk-dots';

interface DeskDotsLiveProps {
  desk: ActDesk;
}

export const DeskDotsLive: FC<DeskDotsLiveProps> = ({ desk }) => {
  const seconds = usePlaybackSeconds(desk.screen.playback.player);
  const { editor } = desk;
  const dots = useDeskDots(desk, seconds).map((dot) => (
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
