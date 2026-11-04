import { z } from 'zod';

const VIEWER_KEYS = [
  'openTab',
  'bigDebt',
  'allPaid',
  'former',
  'fresh',
  'notEnrolled',
  'owner',
  'operator',
] as const;

export const LedgerViewerSchema = z.enum(VIEWER_KEYS);

export type LedgerViewer = z.infer<typeof LedgerViewerSchema>;

export const LedgerMemberSearchSchema = z.object({
  as: LedgerViewerSchema.catch('openTab').default('openTab'),
});

export type LedgerMemberSearch = z.infer<typeof LedgerMemberSearchSchema>;

export const LedgerHubSearchSchema = z.object({
  as: LedgerViewerSchema.catch('owner').default('owner'),
});

export type LedgerHubSearch = z.infer<typeof LedgerHubSearchSchema>;

export const LEDGER_VIEWERS: readonly LedgerViewer[] = VIEWER_KEYS;
