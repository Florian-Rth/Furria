import type { KkStudioGViewerSightOption } from '@furria/ui/KkStudioGViewer';
import { useState } from 'react';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import { SIGHT_AUDIENCE, SIGHT_DANCERS } from '../studio-g-copy';

export const SIGHT_OPTIONS: readonly KkStudioGViewerSightOption[] = [
  { key: 'audience', text: SIGHT_AUDIENCE },
  { key: 'dancers', text: SIGHT_DANCERS },
];

export interface StudioGViewer {
  swapped: boolean;
  viewpoint: StageViewpoint;
  swap: () => void;
  pickSight: (key: string) => void;
}

export const useStudioGViewer = (): StudioGViewer => {
  const [swapped, setSwapped] = useState(false);
  const [viewpoint, setViewpoint] = useState<StageViewpoint>('audience');

  return {
    swapped,
    viewpoint,
    swap: () => {
      setSwapped((current) => !current);
    },
    pickSight: (key) => {
      setViewpoint(key === 'dancers' ? 'dancers' : 'audience');
    },
  };
};
