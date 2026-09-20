import type { KkScreenHeaderKind } from '../../screen-declaration';
import type { KkHandover } from './handover';

export interface KkHeaderMotion {
  opacity: number;
  drift: number;
}

const STAYING: KkHeaderMotion = { opacity: 1, drift: 0 };

export const headerMotionOf = (kind: KkScreenHeaderKind, handover: KkHandover): KkHeaderMotion =>
  kind === 'banner' ? STAYING : { opacity: handover.headerOpacity, drift: handover.headerDrift };
