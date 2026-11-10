import { useState } from 'react';
import type { PromoMember } from '../schemas';

interface LoopBaseline {
  loop: number;
  known: ReadonlySet<number>;
}

export const useLoopBaseline = (
  loop: number,
  members: readonly PromoMember[],
  loaded: boolean,
): ReadonlySet<number> | null => {
  const [baseline, setBaseline] = useState<LoopBaseline | null>(null);

  if (loaded && (baseline === null || baseline.loop !== loop)) {
    setBaseline({ loop, known: new Set(members.map((member) => member.accountId)) });
  }

  return baseline?.known ?? null;
};
