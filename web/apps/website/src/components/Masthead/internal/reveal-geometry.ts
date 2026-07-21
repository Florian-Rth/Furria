export interface OriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RevealGeometry {
  centerXPercent: number;
  centerYPercent: number;
}

export const computeRevealGeometry = (
  origin: OriginRect,
  viewportWidth: number,
  viewportHeight: number,
): RevealGeometry => {
  const centerX = origin.left + origin.width / 2;
  const centerY = origin.top + origin.height / 2;
  return {
    centerXPercent: (centerX / viewportWidth) * 100,
    centerYPercent: (centerY / viewportHeight) * 100,
  };
};
