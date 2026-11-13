import type { KkIconName } from '../KkIcon';
import type { KkStepState } from '../KkStatePill/step-state';

export type KkBulletinMark = 'owed' | 'new' | 'none';

export interface KkBulletinMarkItem {
  key: string;
  icon: KkIconName;
  state: KkStepState;
  label: string;
}
