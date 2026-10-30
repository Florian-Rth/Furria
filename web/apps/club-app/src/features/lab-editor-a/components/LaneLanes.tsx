import { KkLaneTrack } from '@furria/ui/KkLaneTrack';
import type { FC } from 'react';
import type { LaneBorders } from '../hooks/use-lane-borders';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useLaneRows } from '../hooks/use-lane-rows';
import type { LaneZoom } from '../hooks/use-lane-zoom';
import {
  LANE_LANES,
  LANE_MUSIC,
  LANE_NONE,
  LANE_PARTS,
  LANE_PATHS,
  LANE_RULER,
  LANE_SEEK,
  LANE_STEPS,
  LANE_VIDEO,
} from '../lane-copy';
import { LanePlayheadLive } from './LanePlayheadLive';

interface LaneLanesProps {
  lane: LaneEditor;
  zoom: LaneZoom;
  borders: LaneBorders;
}

export const LaneLanes: FC<LaneLanesProps> = ({ lane, zoom, borders }) => {
  const rows = useLaneRows(lane, zoom);
  const { playback, practice } = lane.screen;
  const parts = rows.parts.map((part) => (
    <KkLaneTrack.Block
      key={part.key}
      start={part.start}
      end={part.end}
      lead={null}
      title={part.title}
      meta={part.meta}
      tone="part"
      selected={part.selected}
      current={part.current}
      label={part.label}
      onPress={part.press}
    />
  ));
  const steps = rows.steps.map((step) => (
    <KkLaneTrack.Block
      key={step.key}
      start={step.start}
      end={step.end}
      lead={step.lead}
      title={step.title}
      meta={step.meta}
      tone="step"
      selected={step.selected}
      current={step.current}
      label={step.label}
      onPress={step.press}
    />
  ));
  const edges = borders.borders.map((border) => (
    <KkLaneTrack.Border
      key={border.key}
      share={border.share}
      label={border.label}
      value={border.value}
      active={border.active}
      hint={border.hint}
      onMove={border.move}
      onEnd={border.end}
      onNudge={border.nudge}
    />
  ));
  const movable = lane.screen.evening === null;
  const videos = rows.videos.map((video) => {
    const grab = movable ? video.grab : undefined;

    return (
      <KkLaneTrack.Block
        key={video.key}
        start={video.start}
        end={video.end}
        lead={null}
        title={video.title}
        meta={video.meta}
        tone="video"
        selected={video.selected}
        current={false}
        label={video.label}
        onPress={video.press}
        onGrab={grab}
        onDrag={video.drag}
        onDrop={video.drop}
      />
    );
  });
  const keys = rows.keys.map((key) => (
    <KkLaneTrack.Diamond
      key={key.key}
      share={key.share}
      selected={key.selected}
      dimmed={key.dimmed}
      label={key.label}
      onPress={key.press}
    />
  ));
  const none = <KkLaneTrack.Empty text={LANE_NONE} />;
  const partLane = parts.length === 0 ? none : parts;
  const stepLane = steps.length === 0 ? none : steps;
  const videoLane = videos.length === 0 ? none : videos;
  const keyLane = keys.length === 0 ? none : keys;

  return (
    <KkLaneTrack label={LANE_LANES} width={zoom.width} scrollerRef={zoom.attach} onZoom={zoom.zoom}>
      <KkLaneTrack.Row label={LANE_RULER} aside={null} size="ruler">
        <KkLaneTrack.Ticks ticks={rows.ruler} edge="top" />
        <KkLaneTrack.Scrub label={LANE_SEEK} onSeek={rows.seek} />
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={LANE_PARTS} aside={null} size="thin">
        {partLane}
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={LANE_STEPS} aside={null} size="lane">
        {stepLane}
        {edges}
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={LANE_MUSIC} aside={null} size="wave">
        <KkLaneTrack.Wave values={rows.wave} />
        <KkLaneTrack.Ticks ticks={rows.beats} edge="bottom" />
        <KkLaneTrack.Scrub label={LANE_SEEK} onSeek={rows.seek} />
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={LANE_VIDEO} aside={null} size="lane">
        {videoLane}
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={LANE_PATHS} aside={rows.keysAside} size="lane">
        {keyLane}
      </KkLaneTrack.Row>
      <LanePlayheadLive
        player={playback.player}
        length={playback.length}
        playing={practice.playing}
        zoom={zoom}
      />
    </KkLaneTrack>
  );
};
