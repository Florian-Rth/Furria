import type { KkMasterDetailSpan } from '@furria/ui/KkMasterDetailMaster';

interface HubSpans {
  pane: KkMasterDetailSpan;
  masterWithPane: KkMasterDetailSpan;
  masterAlone: KkMasterDetailSpan;
}

export const HUB_SPANS: HubSpans = { pane: 5, masterWithPane: 7, masterAlone: 12 };
