import type { KkIconName } from '@furria/ui/KkIcon';

export const PLANNER_TOOLS = ['select', 'table', 'row', 'seats', 'measure'] as const;
export type PlannerTool = (typeof PLANNER_TOOLS)[number];

export const PLANNER_VIEWS = ['plan', 'setup'] as const;
export type PlannerView = (typeof PLANNER_VIEWS)[number];

export const TOOL_ICONS: Record<PlannerTool, KkIconName> = {
  select: 'pointer',
  table: 'tables',
  row: 'row',
  seats: 'chair',
  measure: 'ruler',
};

export const isPlannerTool = (value: string): value is PlannerTool =>
  PLANNER_TOOLS.some((tool) => tool === value);

export const isPlannerView = (value: string): value is PlannerView =>
  PLANNER_VIEWS.some((view) => view === value);

export const placesTables = (tool: PlannerTool): boolean =>
  tool === 'table' || tool === 'row' || tool === 'seats';
