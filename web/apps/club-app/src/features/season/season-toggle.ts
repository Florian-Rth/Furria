import { dropAct, pickActs } from '@/features/running-order/running-order-ops';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { RunningOrderDraft } from '@/features/running-order/types';

export const toggledDraftOf = (
  draft: RunningOrderDraft,
  act: CatalogueAct,
  add: boolean,
): RunningOrderDraft | null => {
  const toggled = add ? pickActs(draft, [act], [act.actId]) : dropAct(draft, act.actId);

  return toggled === draft ? null : toggled;
};
