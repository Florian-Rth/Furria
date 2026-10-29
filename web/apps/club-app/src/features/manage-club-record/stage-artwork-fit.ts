import { svgIntrinsicSizeOf } from '@furria/ui/svg-intrinsic-size';
import type { StageSize } from './stage-metres';

export type StageArtworkFit = 'fits' | 'mismatch' | 'unknown';

const ASPECT_TOLERANCE = 0.02;

export const stageArtworkFitOf = (artworkSvg: string, stage: StageSize | null): StageArtworkFit => {
  const artwork = svgIntrinsicSizeOf(artworkSvg);

  if (artwork === null || stage === null) {
    return 'unknown';
  }

  const artworkAspect = artwork.width / artwork.height;
  const stageAspect = stage.widthMetres / stage.depthMetres;

  return Math.abs(artworkAspect / stageAspect - 1) <= ASPECT_TOLERANCE ? 'fits' : 'mismatch';
};
