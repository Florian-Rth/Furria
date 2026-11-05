import type { KkPlanCursor } from '@furria/ui/KkFloorPlan';
import type { KkIconName } from '@furria/ui/KkIcon';

export const HALL_TOOLS = [
  'select',
  'wall',
  'door',
  'area',
  'pillar',
  'line',
  'text',
  'measure',
] as const;

export type HallTool = (typeof HALL_TOOLS)[number];

export const HALL_TOOL_ICONS = {
  select: 'pointer',
  wall: 'wall',
  door: 'door',
  area: 'area',
  pillar: 'pillar',
  line: 'line',
  text: 'text',
  measure: 'ruler',
} as const satisfies Record<HallTool, KkIconName>;

const TOOL_KEYS: Record<string, HallTool> = {
  v: 'select',
  w: 'wall',
  d: 'door',
  f: 'area',
  s: 'pillar',
  l: 'line',
  t: 'text',
  m: 'measure',
};

export const isHallTool = (value: string): value is HallTool =>
  (HALL_TOOLS as readonly string[]).includes(value);

export const toolForKey = (key: string): HallTool | null => TOOL_KEYS[key.toLowerCase()] ?? null;

const TOOL_CURSORS = {
  select: 'default',
  wall: 'crosshair',
  door: 'crosshair',
  area: 'crosshair',
  pillar: 'copy',
  line: 'crosshair',
  text: 'copy',
  measure: 'crosshair',
} as const satisfies Record<HallTool, KkPlanCursor>;

export const cursorOfTool = (tool: HallTool): KkPlanCursor => TOOL_CURSORS[tool];
