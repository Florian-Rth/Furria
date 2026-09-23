import type { KkHandover } from '../internal/logic/handover';
import { useKkShell } from '../internal/logic/shell-context';

export interface KkShellHandoverReading {
  handover: KkHandover;
  density: number;
}

export const useKkShellHandover = (): KkShellHandoverReading => {
  const { handover, density } = useKkShell();

  return { handover, density };
};
