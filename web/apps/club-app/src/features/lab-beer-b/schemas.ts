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

export const PourViewerSchema = z.enum(VIEWER_KEYS);

export type PourViewer = z.infer<typeof PourViewerSchema>;

export const PourMemberSearchSchema = z.object({
  as: PourViewerSchema.catch('openTab').default('openTab'),
});

export const PourHubSearchSchema = z.object({
  as: PourViewerSchema.catch('owner').default('owner'),
});

export const PourBookSearchSchema = z.object({
  as: PourViewerSchema.catch('openTab').default('openTab'),
  stock: z.enum(['empty']).optional().catch(undefined),
});

export type PourBookSearch = z.infer<typeof PourBookSearchSchema>;

export const POUR_VIEWERS: readonly PourViewer[] = VIEWER_KEYS;

export interface PourLabOption {
  id: string;
  label: string;
}

export const isPourViewer = (id: string): id is PourViewer =>
  PourViewerSchema.safeParse(id).success;

export const POUR_OPERATOR_VIEWERS: readonly PourViewer[] = ['owner', 'operator'];
