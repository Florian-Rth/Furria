import type { MotionValue } from 'motion/react';
import type { PointerEvent, SyntheticEvent } from 'react';
import { createContext, useContext } from 'react';
import type { ImageStage } from '../../../internal/stage/use-image-stage';
import type { KkViewerNeighbour } from '../../viewer-steps';
import type { KkViewerItem, KkViewerLabels, KkViewerStepDelta } from '../../viewer-types';

export interface ViewerSlide extends KkViewerNeighbour {
  item: KkViewerItem;
}

export interface ViewerStageHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
}

export interface ViewerArrival {
  opacity: MotionValue<number>;
  pullY: MotionValue<number>;
  pullScale: MotionValue<number>;
}

export interface ViewerState {
  items: readonly KkViewerItem[];
  index: number;
  item: KkViewerItem;
  labels: KkViewerLabels;
  slides: ViewerSlide[];
  stage: ImageStage;
  stageHandlers: ViewerStageHandlers;
  arrival: ViewerArrival;
  hasPrevious: boolean;
  hasNext: boolean;
  step: (delta: KkViewerStepDelta) => void;
  show: (index: number) => void;
  close: () => void;
  onImageLoad: (key: string, event: SyntheticEvent<HTMLImageElement>) => void;
}

export const ViewerContext = createContext<ViewerState | null>(null);

export const useViewer = (): ViewerState => {
  const state = useContext(ViewerContext);

  if (state === null) {
    throw new Error('useViewer must be used inside KkViewer.');
  }

  return state;
};
