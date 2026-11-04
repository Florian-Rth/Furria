import { z } from 'zod';

export const BEER_A_MEMBER_VIEWERS = [
  'openTab',
  'bigDebt',
  'allPaid',
  'former',
  'fresh',
  'notEnrolled',
  'owner',
  'operator',
] as const;

export const BEER_A_HUB_VIEWERS = ['owner', 'operator'] as const;

export const BeerAMemberSearchSchema = z.object({
  as: z.enum(BEER_A_MEMBER_VIEWERS).optional().catch(undefined),
  stock: z.enum(['empty']).optional().catch(undefined),
});

export type BeerAMemberSearch = z.infer<typeof BeerAMemberSearchSchema>;

export const BeerAHubSearchSchema = z.object({
  as: z.enum(BEER_A_HUB_VIEWERS).optional().catch(undefined),
});

export type BeerAHubSearch = z.infer<typeof BeerAHubSearchSchema>;

export type BeerAMemberViewer = (typeof BEER_A_MEMBER_VIEWERS)[number];
export type BeerAHubViewer = (typeof BEER_A_HUB_VIEWERS)[number];
