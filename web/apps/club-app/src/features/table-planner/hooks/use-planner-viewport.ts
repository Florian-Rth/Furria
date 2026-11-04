import type { KkPlanView } from '@furria/ui/floor-plan-view';
import { DEFAULT_PLAN_VIEW, panPlanBy } from '@furria/ui/floor-plan-view';
import type { KkFloorPlanHandle } from '@furria/ui/KkFloorPlan';
import type { RefObject } from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { padBounds } from '@/features/hall-plan/plan-geometry';

const FOCUS_PADDING_CM = 300;

export interface PlannerViewport {
  ref: RefObject<KkFloorPlanHandle | null>;
  view: KkPlanView;
  setView: (view: KkPlanView) => void;
  panBy: (deltaXPx: number, deltaYPx: number) => void;
  fit: () => void;
  focus: (bounds: Bounds) => void;
}

export const usePlannerViewport = (contentBounds: Bounds | null): PlannerViewport => {
  const ref = useRef<KkFloorPlanHandle | null>(null);
  const [view, setView] = useState<KkPlanView>(DEFAULT_PLAN_VIEW);
  const fit = (): void => {
    if (contentBounds !== null) {
      ref.current?.fit(contentBounds);
    }
  };
  const fitOnArrival = useEffectEvent(fit);

  useEffect(() => {
    fitOnArrival();
  }, []);

  return {
    ref,
    view,
    setView,
    panBy: (deltaXPx, deltaYPx) => {
      setView((current) => panPlanBy(current, deltaXPx, deltaYPx));
    },
    fit,
    focus: (bounds) => {
      ref.current?.fit(padBounds(bounds, FOCUS_PADDING_CM));
    },
  };
};
