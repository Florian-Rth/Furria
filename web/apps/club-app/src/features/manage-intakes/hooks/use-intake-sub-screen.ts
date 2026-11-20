import { useState } from 'react';
import { useIntakeQuery } from '../api';
import type { IntakeScreenGate, IntakeScreenNeed } from '../intake-rules';
import { toIntakeScreenGate } from '../intake-rules';
import type { IntakeDetails } from '../schemas';

export interface IntakeSubScreen {
  gate: IntakeScreenGate;
  details: IntakeDetails | null;
}

export const useIntakeSubScreen = (
  intakeId: number | null,
  need: IntakeScreenNeed,
): IntakeSubScreen => {
  const intake = useIntakeQuery(intakeId);
  const [held, setHeld] = useState<IntakeDetails | null>(null);
  const liveGate = toIntakeScreenGate(intake.data, need);
  const live = liveGate === 'open' ? (intake.data ?? null) : null;

  if (live !== null && live !== held) {
    setHeld(live);
  }

  const details = live ?? held;

  return { gate: details === null ? liveGate : 'open', details };
};
