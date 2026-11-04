import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

export const BeerCorrectionReasonSchema = z.enum(['shrinkage', 'breakage', 'miscount']);
export type BeerCorrectionReason = z.infer<typeof BeerCorrectionReasonSchema>;

export const BeerMovementKindSchema = z.enum([
  'delivery',
  'correction',
  'handoverCarry',
  'handedOver',
]);
export type BeerMovementKind = z.infer<typeof BeerMovementKindSchema>;

export const OpenBeerPotSchema = z.object({
  beerPotId: z.number().int(),
  owner: PersonRefSchema.nullable(),
  cratePriceCents: z.number().int(),
  paymentLink: z.string().nullable(),
  paymentNote: z.string().nullable(),
  openedAt: z.iso.datetime({ offset: true }),
});
export type OpenBeerPot = z.infer<typeof OpenBeerPotSchema>;

export const OpenBeerPotResponseSchema = z.object({ pot: OpenBeerPotSchema.nullable() });
export type OpenBeerPotResponse = z.infer<typeof OpenBeerPotResponseSchema>;

export const BeerPotSummarySchema = z.object({
  beerPotId: z.number().int(),
  owner: PersonRefSchema.nullable(),
  cratePriceCents: z.number().int(),
  openedAt: z.iso.datetime({ offset: true }),
  closedAt: z.iso.datetime({ offset: true }).nullable(),
  openTabs: z.number().int(),
  openCrates: z.number().int(),
  openCents: z.number().int(),
});
export type BeerPotSummary = z.infer<typeof BeerPotSummarySchema>;

export const BeerPotsResponseSchema = z.object({ pots: z.array(BeerPotSummarySchema) });
export type BeerPotsResponse = z.infer<typeof BeerPotsResponseSchema>;

export const BeerEnrollmentSchema = PersonRefSchema.extend({
  enrollmentId: z.number().int(),
  startedAt: z.iso.datetime({ offset: true }),
  endedAt: z.iso.datetime({ offset: true }).nullable(),
  endedBy: PersonRefSchema.nullable(),
});
export type BeerEnrollment = z.infer<typeof BeerEnrollmentSchema>;

export const BeerEnrollmentsResponseSchema = z.object({
  enrollments: z.array(BeerEnrollmentSchema),
});
export type BeerEnrollmentsResponse = z.infer<typeof BeerEnrollmentsResponseSchema>;

export const BeerMovementSchema = z.object({
  movementId: z.number().int(),
  kind: BeerMovementKindSchema,
  crates: z.number().int(),
  reason: BeerCorrectionReasonSchema.nullable(),
  bookedAt: z.iso.datetime({ offset: true }),
  bookedBy: PersonRefSchema.nullable(),
});
export type BeerMovement = z.infer<typeof BeerMovementSchema>;

export const BeerStockResponseSchema = z.object({
  crates: z.number().int(),
  forecast: z.object({
    paceWindowDays: z.number().int(),
    cratesTakenInPaceWindow: z.number().int(),
    projectedEmptyOn: z.iso.date().nullable(),
  }),
  movements: z.array(BeerMovementSchema),
});
export type BeerStockResponse = z.infer<typeof BeerStockResponseSchema>;

export const BeerTabPaymentSchema = z.object({
  beerPaymentId: z.number().int(),
  crates: z.number().int(),
  amountCents: z.number().int(),
  bookedAt: z.iso.datetime({ offset: true }),
  bookedBy: PersonRefSchema.nullable(),
});

export const BeerPotTabSchema = z.object({
  person: PersonRefSchema,
  isEnrolled: z.boolean(),
  openCrates: z.number().int(),
  openCents: z.number().int(),
  paidCrates: z.number().int(),
  paidCents: z.number().int(),
  oldestOpenBookedAt: z.iso.datetime({ offset: true }).nullable(),
  payments: z.array(BeerTabPaymentSchema),
});
export type BeerPotTab = z.infer<typeof BeerPotTabSchema>;

export const BeerTabsResponseSchema = z.object({ tabs: z.array(BeerPotTabSchema) });
export type BeerTabsResponse = z.infer<typeof BeerTabsResponseSchema>;

export const BeerJournalCrateSchema = z.object({
  crateId: z.number().int(),
  person: PersonRefSchema.nullable(),
  priceCents: z.number().int(),
  bookedAt: z.iso.datetime({ offset: true }),
  enteredBy: PersonRefSchema.nullable(),
  undoneAt: z.iso.datetime({ offset: true }).nullable(),
  beerPaymentId: z.number().int().nullable(),
});
export type BeerJournalCrate = z.infer<typeof BeerJournalCrateSchema>;

export const BeerJournalPaymentSchema = z.object({
  beerPaymentId: z.number().int(),
  person: PersonRefSchema.nullable(),
  crates: z.number().int(),
  amountCents: z.number().int(),
  bookedAt: z.iso.datetime({ offset: true }),
  bookedBy: PersonRefSchema.nullable(),
  undoneAt: z.iso.datetime({ offset: true }).nullable(),
});
export type BeerJournalPayment = z.infer<typeof BeerJournalPaymentSchema>;

export const BeerJournalResponseSchema = z.object({
  crates: z.array(BeerJournalCrateSchema),
  payments: z.array(BeerJournalPaymentSchema),
});
export type BeerJournalResponse = z.infer<typeof BeerJournalResponseSchema>;

export const BeerPotCreatedSchema = z.object({ beerPotId: z.number().int() });

export const BeerCratesBookedSchema = z.object({
  crateIds: z.array(z.number().int()),
  undoableUntil: z.iso.datetime({ offset: true }),
  beerPaymentId: z.number().int().nullable(),
});

export const BeerPaymentBookedSchema = z.object({
  beerPaymentId: z.number().int(),
  crates: z.number().int(),
  amountCents: z.number().int(),
});

export const BeerHandoverSchema = z.object({
  beerPotId: z.number().int(),
  carriedCrates: z.number().int(),
});
export type BeerHandover = z.infer<typeof BeerHandoverSchema>;

export interface BeerPotSettings {
  cratePriceCents: number;
  paymentLink: string | null;
  paymentNote: string | null;
}

export const BeerPaneSearchSchema = z.object({
  person: z.coerce.number().int().positive().optional().catch(undefined),
});
export type BeerPaneSearch = z.infer<typeof BeerPaneSearchSchema>;
