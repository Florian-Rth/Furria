import type { OverflowEdges } from './use-overflow-edges';

export const chipNavMaskImage =
  'linear-gradient(to right, transparent 0, black var(--chip-fade-start), black calc(100% - var(--chip-fade-end)), transparent 100%)';

export interface ChipNavFadeWidths {
  start: string;
  end: string;
}

export const chipNavFadeWidths = (edges: OverflowEdges, fadeWidth: string): ChipNavFadeWidths => ({
  start: edges.start ? fadeWidth : '0px',
  end: edges.end ? fadeWidth : '0px',
});

export interface ChipNavFadeDurations {
  enter: number;
  leave: number;
}

export const chipNavTransition = (
  edges: OverflowEdges,
  easing: string,
  durations: ChipNavFadeDurations,
): string => {
  const startMs = edges.start ? durations.enter : durations.leave;
  const endMs = edges.end ? durations.enter : durations.leave;
  return `--chip-fade-start ${startMs}ms ${easing}, --chip-fade-end ${endMs}ms ${easing}`;
};
