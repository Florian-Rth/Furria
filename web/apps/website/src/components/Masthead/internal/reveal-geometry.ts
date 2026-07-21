export interface OriginRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RevealGeometry {
  centerX: number;
  centerY: number;
  radius: number;
}

export const computeRevealGeometry = (
  origin: OriginRect,
  viewportWidth: number,
  viewportHeight: number,
): RevealGeometry => {
  const centerX = origin.left + origin.width / 2;
  const centerY = origin.top + origin.height / 2;
  const radius = Math.hypot(
    Math.max(centerX, viewportWidth - centerX),
    Math.max(centerY, viewportHeight - centerY),
  );
  return { centerX, centerY, radius };
};
