import type { PushTraits } from './push-readiness';
import { pushReadinessOf } from './push-readiness';

export const isPushAskOwed = (traits: PushTraits, answeredOnThisDevice: boolean): boolean =>
  !answeredOnThisDevice && pushReadinessOf(traits) !== 'on';
