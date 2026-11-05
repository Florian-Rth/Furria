import { createContext, useContext } from 'react';

export interface FloorPlanState {
  scale: number;
  touch: boolean;
}

export const FloorPlanContext = createContext<FloorPlanState | null>(null);

export const useFloorPlanScale = (): number => {
  const state = useContext(FloorPlanContext);

  if (state === null) {
    throw new Error('useFloorPlanScale must be used inside KkFloorPlan.');
  }

  return state.scale;
};

export const useFloorPlanTouch = (): boolean => {
  const state = useContext(FloorPlanContext);

  if (state === null) {
    throw new Error('useFloorPlanTouch must be used inside KkFloorPlan.');
  }

  return state.touch;
};
