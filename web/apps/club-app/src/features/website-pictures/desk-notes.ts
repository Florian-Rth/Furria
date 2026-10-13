import type { DeskPhase } from './hooks/use-position-desk';
import type { BoardPosition } from './website-board';

export type DeskNote =
  | 'recut'
  | 'failed'
  | 'processing'
  | 'stalled'
  | 'uncut'
  | 'replace'
  | 'decorative';

export const deskNotesOf = (
  phase: DeskPhase,
  position: BoardPosition,
  isUncutUpload: boolean,
): DeskNote[] => {
  if (phase === 'uploading') {
    return isUncutUpload ? ['uncut'] : [];
  }
  if (phase !== 'view') {
    return [];
  }
  const status: DeskNote[] = [];
  if (position.status === 'mismatch') {
    status.push('recut');
  }
  if (position.status === 'failed') {
    status.push('failed');
  }
  if (position.status === 'processing') {
    status.push('processing');
  }
  if (position.status === 'stalled') {
    status.push('stalled');
  }
  if (!position.orphan && position.status !== 'empty') {
    status.push('replace');
  }
  if (!position.orphan && position.decorative) {
    status.push('decorative');
  }
  return status;
};
