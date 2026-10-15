import type { KkPressRulerLane } from '../../press-ruler-data';
import type { RulerColumn } from './ruler-columns';
import { columnsOf } from './ruler-columns';
import type { LaneMetrics } from './ruler-metrics';
import { metricsOf } from './ruler-metrics';
import type { RulerPress } from './ruler-press';
import { pressOrderOf } from './ruler-press';
import type { RulerLaneProbe, RulerProbeState } from './use-ruler-probe';

export interface RulerLaneView {
  metrics: LaneMetrics;
  columns: RulerColumn[];
  cursor: RulerColumn | null;
  probe: RulerLaneProbe;
  delayOf: (markId: string) => number;
}

export const useRulerLane = (
  lane: KkPressRulerLane,
  width: number,
  press: RulerPress,
  probe: RulerProbeState,
): RulerLaneView => {
  const metrics = metricsOf(lane.present);
  const columns = columnsOf(lane.marks, width, metrics.columnGap);
  const orders = pressOrderOf(lane, press.firstOf(lane.key));
  const probed = probe.probe;
  const cursor = probed !== null && probed.lane.key === lane.key ? probed.column : null;

  const delayOf = (markId: string): number => press.delayOf(orders.get(markId) ?? 0);

  return { metrics, columns, cursor, probe: probe.laneProbeOf(lane, columns), delayOf };
};
