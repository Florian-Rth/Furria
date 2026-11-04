import { KkTabLedgerRoot } from './internal/layout/KkTabLedgerRoot';
import { KkTabLedgerHead } from './internal/ui/KkTabLedgerHead';
import { KkTabLedgerLine } from './internal/ui/KkTabLedgerLine';
import { KkTabLedgerPerson } from './internal/ui/KkTabLedgerPerson';

export type { KkTabLedgerHeadTone } from './internal/ui/KkTabLedgerHead';
export type { KkTabLedgerState } from './internal/ui/KkTabLedgerMark';

export const KkTabLedger = Object.assign(KkTabLedgerRoot, {
  Head: KkTabLedgerHead,
  Line: KkTabLedgerLine,
  Person: KkTabLedgerPerson,
});
