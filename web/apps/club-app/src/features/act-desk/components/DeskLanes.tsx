import { KkLaneTrack } from '@furria/ui/KkLaneTrack';
import type { FC } from 'react';
import {
  DESK_LANES,
  DESK_MUSIC,
  DESK_NONE,
  DESK_PARTS,
  DESK_PATHS,
  DESK_RULER,
  DESK_SEEK,
  DESK_STEPS,
  DESK_VIDEO,
} from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import type { DeskBorders } from '../hooks/use-desk-borders';
import { useDeskRows } from '../hooks/use-desk-rows';
import type { DeskZoom } from '../hooks/use-desk-zoom';
import { DeskPlayheadLive } from './DeskPlayheadLive';

interface DeskLanesProps {
  desk: ActDesk;
  zoom: DeskZoom;
  borders: DeskBorders;
}

export const DeskLanes: FC<DeskLanesProps> = ({ desk, zoom, borders }) => {
  const rows = useDeskRows(desk, zoom);
  const { playback, practice, evening } = desk.screen;
  const movable = evening === null;
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
      onGrab={key.grab}
      onDrag={key.drag}
      onDrop={key.drop}
      onNudge={key.nudge}
    />
  ));
  const none = <KkLaneTrack.Empty text={DESK_NONE} />;
  const partLane = parts.length === 0 ? none : parts;
  const stepLane = steps.length === 0 ? none : steps;
  const videoLane = videos.length === 0 ? none : videos;
  const keyLane = keys.length === 0 ? none : keys;

  return (
    <KkLaneTrack label={DESK_LANES} width={zoom.width} scrollerRef={zoom.attach} onZoom={zoom.zoom}>
      <KkLaneTrack.Row label={DESK_RULER} aside={null} size="ruler">
        <KkLaneTrack.Ticks ticks={rows.ruler} edge="top" />
        <KkLaneTrack.Scrub label={DESK_SEEK} onSeek={rows.seek} />
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={DESK_PARTS} aside={null} size="thin">
        {partLane}
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={DESK_STEPS} aside={null} size="lane">
        {stepLane}
        {edges}
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={DESK_MUSIC} aside={null} size="wave">
        <KkLaneTrack.Wave values={rows.wave} />
        <KkLaneTrack.Ticks ticks={rows.beats} edge="bottom" />
        <KkLaneTrack.Scrub label={DESK_SEEK} onSeek={rows.seek} />
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={DESK_VIDEO} aside={null} size="lane">
        {videoLane}
      </KkLaneTrack.Row>
      <KkLaneTrack.Row label={DESK_PATHS} aside={rows.keysAside} size="lane">
        {keyLane}
      </KkLaneTrack.Row>
      <DeskPlayheadLive
        player={playback.player}
        length={playback.length}
        playing={practice.playing}
        zoom={zoom}
      />
    </KkLaneTrack>
  );
};
