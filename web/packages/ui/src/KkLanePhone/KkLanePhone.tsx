import { KkLanePhoneArea } from './internal/layout/KkLanePhoneArea';
import { KkLanePhoneRoot } from './internal/layout/KkLanePhoneRoot';
import { KkLanePhoneSplit } from './internal/layout/KkLanePhoneSplit';

export type { KkLanePhoneAreaName } from './internal/layout/KkLanePhoneArea';

export const KkLanePhone = Object.assign(KkLanePhoneRoot, {
  Area: KkLanePhoneArea,
  Split: KkLanePhoneSplit,
});
