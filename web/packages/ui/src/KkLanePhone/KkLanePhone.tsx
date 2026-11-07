import { KkLanePhoneArea } from './internal/layout/KkLanePhoneArea';
import { KkLanePhoneRoot } from './internal/layout/KkLanePhoneRoot';
import { KkLanePhoneSplit } from './internal/layout/KkLanePhoneSplit';
import { KkLanePhoneWork } from './internal/layout/KkLanePhoneWork';

export type { KkLanePhoneAreaName } from './internal/layout/KkLanePhoneArea';
export type { KkLanePhoneSplitKind } from './internal/layout/KkLanePhoneSplit';

export const KkLanePhone = Object.assign(KkLanePhoneRoot, {
  Area: KkLanePhoneArea,
  Split: KkLanePhoneSplit,
  Work: KkLanePhoneWork,
});
