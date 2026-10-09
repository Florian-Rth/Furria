import type { KkFrameMark, KkFrameState } from '@furria/ui';
import type { AlbumFrame } from './album-frames';
import { frameMarkOf } from './album-frames';
import { frameCaption } from './album-labels';
import { frameNumberOf } from './gallery-scenes';
import { clockLabel, durationLabel, frameStateOf, shownSourceOf } from './gallery-view';

export interface AlbumTile {
  frameId: string;
  label: string;
  source: string | undefined;
  latentLabel: string;
  state: KkFrameState;
  number: string;
  mark: KkFrameMark;
  duration: string | undefined;
}

export const albumTileOf = (frame: AlbumFrame, showsSelection: boolean): AlbumTile => {
  const clock = clockLabel(frame.capturedAt);
  return {
    frameId: String(frame.id),
    label: frameCaption(frame.number, clock),
    source: shownSourceOf(frame.item),
    latentLabel: clock,
    state: frameStateOf(frame.item),
    number: frameNumberOf(frame.number),
    mark: frameMarkOf(frame.item, showsSelection),
    duration: frame.item.kind === 'video' ? durationLabel(frame.item.durationSeconds) : undefined,
  };
};
