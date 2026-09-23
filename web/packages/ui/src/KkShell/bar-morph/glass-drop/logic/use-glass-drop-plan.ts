import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import type { KkBarMorphScene } from '../../../bar-morph';
import { useBarMorphDebut } from '../../../use-bar-morph-debut';
import type { GlassDropPlan } from './glass-drop-plan';
import { glassDropPlanOf } from './glass-drop-plan';

export const useGlassDropPlan = (scene: KkBarMorphScene): GlassDropPlan => {
  const debut = useBarMorphDebut(scene);
  const reduced = useReducedMotion();

  return glassDropPlanOf({ scene, debut, reduced });
};
