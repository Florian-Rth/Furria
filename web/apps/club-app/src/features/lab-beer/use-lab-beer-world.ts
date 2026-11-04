import { useState } from 'react';
import type { LabBeerOutcome, LabBeerRefusal } from './beer-lab-actions';
import { LAB_BEER_WORLD } from './beer-lab-fixture';
import type { LabBeerWorld } from './beer-lab-types';

export interface LabBeerWorldState {
  world: LabBeerWorld;
  now: () => string;
  apply: (change: (world: LabBeerWorld, at: string) => LabBeerOutcome) => LabBeerRefusal | null;
  reset: () => void;
}

export const useLabBeerWorld = (): LabBeerWorldState => {
  const [world, setWorld] = useState<LabBeerWorld>(LAB_BEER_WORLD);
  const [shiftMs] = useState(() => Date.parse(LAB_BEER_WORLD.now) - Date.now());

  const now = (): string => new Date(Date.now() + shiftMs).toISOString();

  const apply = (
    change: (current: LabBeerWorld, at: string) => LabBeerOutcome,
  ): LabBeerRefusal | null => {
    const at = now();
    const outcome = change(world, at);

    if (outcome.kind === 'refused') {
      return outcome.refusal;
    }

    setWorld({ ...outcome.world, now: at });

    return null;
  };

  const reset = (): void => {
    setWorld(LAB_BEER_WORLD);
  };

  return { world, now, apply, reset };
};
