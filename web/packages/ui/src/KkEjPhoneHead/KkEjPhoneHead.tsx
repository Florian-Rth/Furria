import { KkEjPhoneHeadName } from './internal/layout/KkEjPhoneHeadName';
import { KkEjPhoneHeadRoot } from './internal/layout/KkEjPhoneHeadRoot';
import { KkEjPhoneHeadStatus } from './internal/ui/KkEjPhoneHeadStatus';
import { KkEjPhoneHeadTitle } from './internal/ui/KkEjPhoneHeadTitle';

export type { KkEjPhoneHeadStatusTone } from './internal/ui/KkEjPhoneHeadStatus';

export const KkEjPhoneHead = Object.assign(KkEjPhoneHeadRoot, {
  Name: KkEjPhoneHeadName,
  Status: KkEjPhoneHeadStatus,
  Title: KkEjPhoneHeadTitle,
});
