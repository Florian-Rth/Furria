import { useState } from 'react';
import type { KkCrop } from '../image-crop';
import type { StagePolicy } from '../internal/stage/stage-machine';
import type { ImageStage } from '../internal/stage/use-image-stage';
import { useImageStage } from '../internal/stage/use-image-stage';
import { useReducedMotion } from '../internal/use-reduced-motion';

export const KK_CROP_MAX_ZOOM = 4;

const CROP_POLICY: Omit<StagePolicy, 'reducedMotion'> = {
  fit: 'cover',
  maxZoom: KK_CROP_MAX_ZOOM,
  doubleTapZoom: 2,
  swipe: false,
  pull: false,
  hasPrevious: false,
  hasNext: false,
};

interface UseCropStageOptions {
  initialCrop: KkCrop | null;
  onCropChange: (crop: KkCrop) => void;
}

export interface KkCropStage {
  stage: ImageStage;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const useCropStage = ({ initialCrop, onCropChange }: UseCropStageOptions): KkCropStage => {
  const [zoom, setZoom] = useState(1);
  const reducedMotion = useReducedMotion();
  const stage = useImageStage({
    policy: { ...CROP_POLICY, reducedMotion },
    anchor: initialCrop,
    onIntent: (intent) => {
      if (intent.kind !== 'transformed') {
        return;
      }
      setZoom(intent.transform.zoom);
      const crop = stage.crop();
      if (crop !== null) {
        onCropChange(crop);
      }
    },
  });

  const onZoomChange = (next: number): void => {
    stage.dispatch({ type: 'zoomTo', zoom: next });
  };

  return { stage, zoom, onZoomChange };
};
