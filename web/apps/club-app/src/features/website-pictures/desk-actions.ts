import type { DeskPhase } from './hooks/use-position-desk';
import type { BoardPosition } from './website-board';

export type DeskAction =
  | 'upload'
  | 'gallery'
  | 'copy'
  | 'crop'
  | 'recut'
  | 'transfer'
  | 'remove'
  | 'commit'
  | 'retry'
  | 'cancel';

interface DeskOffer {
  hasCopySources: boolean;
  hasTransferTargets: boolean;
}

const canCut = (position: BoardPosition): boolean =>
  position.picture?.picture.uncroppedUrl != null &&
  (position.status === 'ready' || position.status === 'mismatch');

const offered = (actions: readonly (DeskAction | null)[]): DeskAction[] =>
  actions.filter((action) => action !== null);

const viewActionsOf = (position: BoardPosition, offer: DeskOffer): DeskAction[] => {
  if (position.orphan) {
    return offered([offer.hasTransferTargets ? 'transfer' : null, 'remove']);
  }
  const cut: DeskAction = position.status === 'mismatch' ? 'recut' : 'crop';
  return offered([
    'upload',
    'gallery',
    offer.hasCopySources ? 'copy' : null,
    canCut(position) ? cut : null,
    position.status === 'empty' ? null : 'remove',
  ]);
};

export const deskActionsOf = (
  phase: DeskPhase,
  position: BoardPosition,
  offer: DeskOffer,
): DeskAction[] => {
  switch (phase) {
    case 'view':
      return viewActionsOf(position, offer);
    case 'cropping':
    case 'saving':
      return ['commit', 'cancel'];
    case 'uploading':
      return ['cancel'];
    case 'failed':
      return ['retry', 'cancel'];
  }
};
