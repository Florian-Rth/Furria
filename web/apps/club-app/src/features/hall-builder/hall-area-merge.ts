import type { AreaMergeResult } from '@/features/hall-plan/hall-ops';
import type { HallDocument } from '@/features/hall-plan/schemas';

export type AreaMergeState = 'hidden' | 'ready' | 'apart';

export const selectedAreaCountOf = (document: HallDocument, selection: readonly string[]): number =>
  document.elements.filter((element) => element.kind === 'area' && selection.includes(element.id))
    .length;

export const areaMergeStateOf = (merge: AreaMergeResult | null): AreaMergeState => {
  if (merge === null) {
    return 'hidden';
  }

  return merge.kind === 'merged' ? 'ready' : 'apart';
};
