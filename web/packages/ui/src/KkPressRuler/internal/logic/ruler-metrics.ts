export interface LaneMetrics {
  height: number;
  baseline: number;
  cellWidth: number;
  cellHeight: number;
  cellGap: number;
  maxStack: number;
  columnGap: number;
}

export const PRESENT_LANE: LaneMetrics = {
  height: 40,
  baseline: 37,
  cellWidth: 3,
  cellHeight: 4,
  cellGap: 1,
  maxStack: 6,
  columnGap: 4,
};

export const PAST_LANE: LaneMetrics = {
  height: 16,
  baseline: 13,
  cellWidth: 2,
  cellHeight: 2,
  cellGap: 1,
  maxStack: 4,
  columnGap: 2.5,
};

export const LOUPE_LANE: LaneMetrics = {
  height: 46,
  baseline: 40,
  cellWidth: 7,
  cellHeight: 6,
  cellGap: 1,
  maxStack: 5,
  columnGap: 8,
};

export const LOUPE_WIDTH = 236;
export const LOUPE_SPAN = 0.045;
export const LOUPE_LIFT = 12;
export const LOUPE_HEIGHT = 168;
export const PROBE_REACH = 16;
export const LOUPE_TITLES = 3;
export const DRAFT_TRAY_OFFSET = 7;

export const metricsOf = (present: boolean): LaneMetrics => (present ? PRESENT_LANE : PAST_LANE);

export const GUTTER_START = 5.75;
export const GUTTER_END = 3.25;
export const AXIS_HEIGHT = 2;
export const TODAY_TAG_GAP = 3;
