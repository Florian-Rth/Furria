import { KkStudioGTimeline } from '@furria/ui/KkStudioGTimeline';
import type { FC } from 'react';
import type { StudioGLanes as StudioGLanesModel } from '../hooks/use-studio-g-lanes';
import {
  LANE_MOVEMENT,
  LANE_MUSIC,
  LANE_PARTS,
  LANE_RULER,
  LANE_STEPS,
  LANE_VIDEOS,
} from '../studio-g-copy';

interface StudioGLanesProps {
  lanes: StudioGLanesModel;
}

export const StudioGLanes: FC<StudioGLanesProps> = ({ lanes }) => {
  const songs = lanes.songs.map((song) => (
    <KkStudioGTimeline.Song
      key={song.key}
      start={song.start}
      end={song.end}
      number={song.number}
      name={song.name}
      label={song.label}
      selected={song.selected}
      onSelect={song.select}
    />
  ));
  const parts = lanes.parts.map((part) => (
    <KkStudioGTimeline.Block
      key={part.key}
      kind="part"
      start={part.start}
      end={part.end}
      text={part.name}
      label={part.label}
      selected={part.selected}
      onSelect={part.select}
    />
  ));
  const steps = lanes.steps.map((step) => (
    <KkStudioGTimeline.Block
      key={step.key}
      kind="step"
      start={step.start}
      end={step.end}
      number={step.number}
      text={step.name}
      label={step.label}
      selected={step.selected}
      opensPart={step.opensPart}
      onSelect={step.select}
    />
  ));
  const mark =
    lanes.mark === null ? null : (
      <KkStudioGTimeline.Mark
        seconds={lanes.mark.seconds}
        label={lanes.mark.label}
        dragging={lanes.mark.dragging}
        onDrag={lanes.mark.drag}
      />
    );
  const videos = lanes.videos.map((video) => (
    <KkStudioGTimeline.Block
      key={video.key}
      kind="video"
      start={video.start}
      end={video.end}
      text={video.text}
      label={video.label}
      selected={video.selected}
      main={video.main}
      attention={video.outdated}
      onSelect={video.select}
      onDrag={video.drag}
    />
  ));

  return (
    <>
      <KkStudioGTimeline.Lane kind="ruler" label={LANE_RULER}>
        <KkStudioGTimeline.Ruler
          ticks={lanes.rulerTicks}
          labels={lanes.rulerLabels}
          lengthSeconds={lanes.length}
        />
      </KkStudioGTimeline.Lane>
      <KkStudioGTimeline.Lane kind="music" label={LANE_MUSIC}>
        <KkStudioGTimeline.Wave
          values={lanes.wave}
          cuts={lanes.cuts}
          lengthSeconds={lanes.length}
        />
        {songs}
      </KkStudioGTimeline.Lane>
      <KkStudioGTimeline.Lane kind="parts" label={LANE_PARTS}>
        {parts}
      </KkStudioGTimeline.Lane>
      <KkStudioGTimeline.Lane kind="steps" label={LANE_STEPS}>
        {steps}
        {mark}
      </KkStudioGTimeline.Lane>
      <KkStudioGTimeline.Lane kind="videos" label={LANE_VIDEOS}>
        {videos}
      </KkStudioGTimeline.Lane>
      <KkStudioGTimeline.Lane kind="movement" label={LANE_MOVEMENT}>
        <KkStudioGTimeline.Ticks
          ticks={lanes.ticks}
          bars={lanes.bars}
          onSelect={lanes.selectTick}
        />
      </KkStudioGTimeline.Lane>
    </>
  );
};
