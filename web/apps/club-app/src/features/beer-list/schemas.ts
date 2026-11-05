import { z } from 'zod';

export const BeerListPersonSchema = z.object({
  personId: z.int().positive(),
  firstName: z.string(),
  lastName: z.string(),
});
export type BeerListPerson = z.infer<typeof BeerListPersonSchema>;

const PaymentLinkSchema = z.url({ protocol: /^https$/ }).nullable();

export const OpenBeerPotSchema = z.object({
  beerPotId: z.int().positive(),
  owner: BeerListPersonSchema.nullable(),
  cratePriceCents: z.int().positive(),
  paymentLink: PaymentLinkSchema,
  openedAt: z.iso.datetime({ offset: true }),
  hasStock: z.boolean(),
});
export type OpenBeerPot = z.infer<typeof OpenBeerPotSchema>;

export const OpenBeerPotResponseSchema = z.object({ pot: OpenBeerPotSchema.nullable() });
export type OpenBeerPotResponse = z.infer<typeof OpenBeerPotResponseSchema>;

export const BeerTabCrateSchema = z.object({
  crateId: z.int().positive(),
  priceCents: z.int().nonnegative(),
  bookedAt: z.iso.datetime({ offset: true }),
  enteredBy: BeerListPersonSchema.nullable(),
  paidAt: z.iso.datetime({ offset: true }).nullable(),
});
export type BeerTabCrate = z.infer<typeof BeerTabCrateSchema>;

export const BeerTabPotSchema = z.object({
  beerPotId: z.int().positive(),
  isOpen: z.boolean(),
  openedAt: z.iso.datetime({ offset: true }),
  owner: BeerListPersonSchema.nullable(),
  paymentLink: PaymentLinkSchema,
  openCrates: z.int().nonnegative(),
  openCents: z.int().nonnegative(),
  paidCrates: z.int().nonnegative(),
  paidCents: z.int().nonnegative(),
  crates: z.array(BeerTabCrateSchema),
});
export type BeerTabPot = z.infer<typeof BeerTabPotSchema>;

export const BeerTabSchema = z.object({ pots: z.array(BeerTabPotSchema) });
export type BeerTab = z.infer<typeof BeerTabSchema>;

export const BeerGiverSchema = BeerListPersonSchema.extend({ crates: z.int().positive() });
export type BeerGiver = z.infer<typeof BeerGiverSchema>;

export const BeerGiversSchema = z.object({ givers: z.array(BeerGiverSchema) });
export type BeerGivers = z.infer<typeof BeerGiversSchema>;

export const BookedBeerCratesSchema = z.object({
  crateIds: z.array(z.int().positive()).min(1),
  undoableUntil: z.iso.datetime({ offset: true }),
});
export type BookedBeerCrates = z.infer<typeof BookedBeerCratesSchema>;
