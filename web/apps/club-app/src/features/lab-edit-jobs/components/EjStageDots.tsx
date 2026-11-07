import { Stage } from '@furria/studio/Stage';
import type { StudioStageDot } from '@furria/studio/studio-stage-dots';
import { studioStageDotsOf } from '@furria/studio/studio-stage-dots';
import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import type { StudioStageWork } from '@furria/studio/use-studio-stage-work';
import { KkEjStageMeasure } from '@furria/ui/KkEjStageMeasure';
import type { KkEjStageNameSize } from '@furria/ui/KkEjStageName';
import { KkEjStageName } from '@furria/ui/KkEjStageName';
import type { FC } from 'react';
import { EJ_FREE_NAME } from '../edit-jobs-copy';
import type { EjArrange } from '../hooks/use-arrange';
import { useBoxSize } from '../hooks/use-box-size';
import type { StageNamePlace } from '../stage-names';
import { stageNamesOf } from '../stage-names';
import { EjStageToolbar } from './EjStageToolbar';

const NO_PLACES: ReadonlyMap<string, StageNamePlace> = new Map();

interface NamedDot extends StudioStageDot {
  shownName: string;
  free: boolean;
  place: StageNamePlace | null;
}

interface EjStageDotsProps {
  screen: StudioWorkScreen;
  editor: ActStudioStage;
  arrange: EjArrange;
  work: StudioStageWork;
  named: boolean;
  bigNames: boolean;
  nameSize: KkEjStageNameSize;
}

export const EjStageDots: FC<EjStageDotsProps> = ({
  screen,
  editor,
  arrange,
  work,
  named,
  bigNames,
  nameSize,
}) => {
  const seconds = usePlaybackSeconds(screen.playback.player);
  const { frame } = work.gestures;
  const { dots, anchor } = studioStageDotsOf({
    scene: editor.scene,
    seconds,
    selected: editor.selected,
    dimOthers: !editor.formation,
    lifted: work.lifted,
    frame,
    choose: work.choose,
    nudge: work.nudge,
  });
  const names = new Map(
    editor.scene.spots.map((spot) => [String(spot.spotId), spot.person?.firstName ?? null]),
  );
  const box = useBoxSize();
  const spots = dots.map((dot) => ({
    key: dot.key,
    x: dot.x,
    y: dot.y,
    name: names.get(dot.key) ?? EJ_FREE_NAME,
  }));
  const places =
    box.size === null || !named
      ? NO_PLACES
      : stageNamesOf(spots, box.size, bigNames ? nameSize : 'small');
  const namedDots: NamedDot[] = dots.map((dot) => {
    const name = names.get(dot.key) ?? null;
    const place = places.get(dot.key);

    return {
      ...dot,
      shownName: name ?? EJ_FREE_NAME,
      free: name === null,
      place: place ?? null,
    };
  });
  const shownDots = namedDots.map((dot) => (
    <Stage.Dot
      key={dot.key}
      x={dot.x}
      y={dot.y}
      number={dot.number}
      kind={dot.kind}
      turn={dot.turn}
      name={dot.shownName}
      nameSide="none"
      selected={dot.selected}
      lifted={dot.lifted}
      dimmed={dot.dimmed}
      keys={dot.keys}
    />
  ));
  const tags = namedDots.flatMap((dot) =>
    dot.place === null
      ? []
      : [
          <KkEjStageName
            key={`name:${dot.key}`}
            x={dot.x}
            y={dot.y}
            dx={dot.place.dx}
            dy={dot.place.dy}
            name={dot.shownName}
            free={dot.free}
            selected={dot.selected}
            size={dot.place.size}
          />,
        ],
  );
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
  const toolbar =
    toolbarShown && anchor !== null ? (
      <EjStageToolbar editor={editor} arrange={arrange} anchor={anchor} />
    ) : null;

  return (
    <>
      <KkEjStageMeasure measureRef={box.ref} />
      {shownDots}
      {tags}
      {handles}
      {toolbar}
    </>
  );
};
