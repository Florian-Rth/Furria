import type { KkMasterDetailSpan } from '@furria/ui/KkMasterDetailMaster';

interface HubSpans {
  pane: KkMasterDetailSpan;
  masterWide: KkMasterDetailSpan;
  masterNarrow: KkMasterDetailSpan;
}

export const HUB_SPANS: HubSpans = { pane: 5, masterWide: 7, masterNarrow: 12 };
