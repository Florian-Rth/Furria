import type { OverflowEdges } from './use-overflow-edges';

export const edgeFadeMaskImage =
  'linear-gradient(to right, transparent 0, black var(--kk-edge-fade-start), black calc(100% - var(--kk-edge-fade-end)), transparent 100%)';

export interface EdgeFadeWidths {
  start: string;
  end: string;
}

export const edgeFadeWidths = (edges: OverflowEdges, fadeWidth: string): EdgeFadeWidths => ({
  start: edges.start ? fadeWidth : '0px',
  end: edges.end ? fadeWidth : '0px',
});

export interface EdgeFadeDurations {
  enter: number;
  leave: number;
}

export const edgeFadeTransition = (
  edges: OverflowEdges,
  easing: string,
  durations: EdgeFadeDurations,
): string => {
  const startMs = edges.start ? durations.enter : durations.leave;
  const endMs = edges.end ? durations.enter : durations.leave;
  return `--kk-edge-fade-start ${startMs}ms ${easing}, --kk-edge-fade-end ${endMs}ms ${easing}`;
};
