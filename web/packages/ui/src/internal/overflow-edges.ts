const subpixelTolerance = 1;

export interface OverflowEdges {
  start: boolean;
  end: boolean;
}

export const computeOverflowEdges = (
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
): OverflowEdges => ({
  start: scrollLeft > subpixelTolerance,
  end: scrollLeft + clientWidth < scrollWidth - subpixelTolerance,
});
