import { Stage } from '@furria/studio/Stage';
import { studioStageDotsOf } from '@furria/studio/studio-stage-dots';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import type { StudioStageWork } from '../hooks/use-studio-stage-work';
import { StudioStageToolbar } from './StudioStageToolbar';

interface StudioStageDotsLiveProps {
  screen: StudioScreen;
  editor: ActStudioStage;
  work: StudioStageWork;
}

export const StudioStageDotsLive: FC<StudioStageDotsLiveProps> = ({ screen, editor, work }) => {
  const seconds = usePlaybackSeconds(screen.playback.player);
  const { dots, anchor } = studioStageDotsOf({
    scene: editor.scene,
    seconds,
    selected: editor.selected,
    dimOthers: !editor.formation,
    lifted: work.lifted,
    frame: work.gestures.frame,
    choose: work.choose,
    nudge: work.nudge,
  });
  const shownDots = dots.map((dot) => (
    <Stage.Dot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
      name={dot.name}
      nameSide={dot.nameSide}
      selected={dot.selected}
      lifted={dot.lifted}
      dimmed={dot.dimmed}
      keys={dot.keys}
    />
  ));
  const handles = editor.movement.handles.map((handle) => (
    <Stage.Handle
      key={handle.spotId}
      x={handle.x}
      y={handle.y}
      active={work.bending === handle.spotId}
    />
  ));
  const toolbarShown =
    editor.toolbar && anchor !== null && work.lifted.size === 0 && work.bending === null;
  const toolbar = toolbarShown ? <StudioStageToolbar editor={editor} anchor={anchor} /> : null;

  return (
    <>
      {shownDots}
      {handles}
      {toolbar}
    </>
  );
};
