import { formatReadoutTime } from '@furria/studio/drag-readout';
import type { MusicSegment } from '@furria/studio/music-timeline';
import { countAt } from '@furria/studio/music-timeline';
import { waveReadoutDetailOf } from '@furria/studio/studio-copy';
import type { CentreDragValue } from '@furria/studio/use-centre-scrub';
import type { DragReadout } from '@furria/studio/use-drag-lift';

export interface WaveReadout {
  x: number;
  y: number;
  value: string;
  detail: string | null;
}

export const waveReadoutOf = (
  lifted: DragReadout<CentreDragValue> | null,
  segments: readonly MusicSegment[],
): WaveReadout | null =>
  lifted === null
    ? null
    : {
        x: lifted.placement.x,
        y: lifted.placement.y,
        value: formatReadoutTime(lifted.value.seconds),
        detail: waveReadoutDetailOf(countAt(segments, lifted.value.seconds), lifted.value.tier),
      };
