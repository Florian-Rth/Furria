import { useTheme } from '@mui/material/styles';
import type { RefObject } from 'react';
import { useLayoutEffect, useState } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkBarMorphScene } from '../../bar-morph';
import { useBarMorphDebut } from '../../use-bar-morph-debut';
import { runClock } from './relay-clock';
import { arrivalOf, captureDeparture } from './relay-dom';
import { createGhostLayer } from './relay-ghosts';
import { relayPlanOf } from './relay-plan';
import { relayRunOf } from './relay-runs';

const ABOVE_BAR = 1;

export const useRelay = (
  scene: KkBarMorphScene,
  wrapperRef: RefObject<HTMLElement | null>,
): void => {
  const theme = useTheme();
  const debut = useBarMorphDebut(scene);
  const reducedMotion = useReducedMotion();
  const plan = relayPlanOf({ debut, reducedMotion, move: scene.move });
  const [departure] = useState(() => (plan === 'settled' ? null : captureDeparture()));
  const zIndex = theme.zIndex.appBar + ABOVE_BAR;
  const flare = (theme.vars ?? theme).palette.primary.main;
  const { move } = scene;

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;

    if (plan === 'settled' || departure === null || wrapper === null) {
      return;
    }

    const run = relayRunOf({
      plan,
      move,
      departure,
      arrival: arrivalOf(wrapper),
      layer: createGhostLayer(zIndex),
      flare,
    });

    run.frame(0);

    const stop = runClock(run.duration, run.frame, run.finish);

    return () => {
      stop();
      run.finish();
    };
  }, [plan, departure, move, zIndex, flare, wrapperRef]);
};
