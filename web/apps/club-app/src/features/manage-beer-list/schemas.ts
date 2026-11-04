import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';
import { causeFor, centsOfPriceText, countOfText, stockChangeOf, textOrNull } from './beer-hub';
import {
  CAUSE_MISSING,
  COUNT_INVALID,
  countRangeOf,
  DETAILS_MISSING,
  OWNER_MISSING,
  PERSON_MISSING,
  PRICE_INVALID,
  SUCCESSOR_MISSING,
} from './beer-hub-copy';

export const BeerCorrectionReasonSchema = z.enum(['shrinkage', 'breakage', 'miscount']);
export type BeerCorrectionReason = z.infer<typeof BeerCorrectionReasonSchema>;

export const BeerStockDirectionSchema = z.enum(['up', 'down']);
export type BeerStockDirection = z.infer<typeof BeerStockDirectionSchema>;

export const BeerStockCauseSchema = z.enum(['delivery', ...BeerCorrectionReasonSchema.options]);
export type BeerStockCause = z.infer<typeof BeerStockCauseSchema>;

export const BeerStockChangeSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('delivery'), crates: z.number().int() }),
  z.object({
    kind: z.literal('correction'),
    crates: z.number().int(),
    reason: BeerCorrectionReasonSchema,
  }),
]);
export type BeerStockChange = z.infer<typeof BeerStockChangeSchema>;

export const BeerMovementKindSchema = z.enum([
  'delivery',
  'correction',
  'handoverCarry',
  'handedOver',
]);
export type BeerMovementKind = z.infer<typeof BeerMovementKindSchema>;

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

export const BeerPotSettingsSchema = z.object({
  cratePriceCents: z.number().int().positive(),
  paymentLink: z.string().nullable(),
  paymentNote: z.string().nullable(),
});
export type BeerPotSettings = z.infer<typeof BeerPotSettingsSchema>;

type IssueContext = z.RefinementCtx;

const addIssue = (ctx: IssueContext, field: string, message: string): void => {
  ctx.addIssue({ code: 'custom', message, path: [field] });
};

const BeerStockFieldsSchema = z.object({
  direction: BeerStockDirectionSchema,
  cause: BeerStockCauseSchema.nullable(),
  crates: z.string(),
});
export type BeerStockForm = z.infer<typeof BeerStockFieldsSchema>;

export const BeerStockFormSchema = BeerStockFieldsSchema.transform((form, ctx): BeerStockChange => {
  const count = countOfText(form.crates);
  const change = stockChangeOf(form.direction, form.cause, count);

  if (count < 1) {
    addIssue(ctx, 'crates', COUNT_INVALID);
  }
  if (causeFor(form.direction, form.cause) === null) {
    addIssue(ctx, 'cause', CAUSE_MISSING);
  }

  return change ?? z.NEVER;
});

const countWithin = (text: string, max: number, ctx: IssueContext, field: string): number => {
  const count = countOfText(text);

  if (count < 1 || count > max) {
    addIssue(ctx, field, countRangeOf(max));
  }

  return count;
};

const BeerPaymentFieldsSchema = z.object({ crates: z.string() });
export type BeerPaymentForm = z.infer<typeof BeerPaymentFieldsSchema>;

export const beerPaymentFormSchema = (openCrates: number): z.ZodType<number, BeerPaymentForm> =>
  BeerPaymentFieldsSchema.transform((form, ctx) =>
    countWithin(form.crates, openCrates, ctx, 'crates'),
  );

const BeerCratesFieldsSchema = z.object({
  personId: z.string(),
  count: z.string(),
  paid: z.boolean(),
});
export type BeerCratesForm = z.infer<typeof BeerCratesFieldsSchema>;

export const BeerCratesBookingSchema = z.object({
  personId: z.number().int(),
  count: z.number().int(),
  paid: z.boolean(),
});
export type BeerCratesBooking = z.infer<typeof BeerCratesBookingSchema>;

export const beerCratesFormSchema = (
  personIds: readonly number[],
  maxCount: number,
): z.ZodType<BeerCratesBooking, BeerCratesForm> =>
  BeerCratesFieldsSchema.transform((form, ctx) => {
    const personId = Number(form.personId);
    const count = countWithin(form.count, maxCount, ctx, 'count');

    if (form.personId === '' || !personIds.includes(personId)) {
      addIssue(ctx, 'personId', PERSON_MISSING);
    }

    return { personId, count, paid: form.paid };
  });

const BeerPotFieldsSchema = z.object({
  person: PersonRefSchema.nullable(),
  cratePrice: z.string(),
  paymentLink: z.string(),
  paymentNote: z.string(),
});
export type BeerPotForm = z.infer<typeof BeerPotFieldsSchema>;

const potSettingsOf = (form: BeerPotForm, ctx: IssueContext): BeerPotSettings => {
  const cratePriceCents = centsOfPriceText(form.cratePrice);
  const paymentLink = textOrNull(form.paymentLink);
  const paymentNote = textOrNull(form.paymentNote);

  if (cratePriceCents === null) {
    addIssue(ctx, 'cratePrice', PRICE_INVALID);
  }
  if (paymentLink === null && paymentNote === null) {
    addIssue(ctx, 'paymentNote', DETAILS_MISSING);
  }

  return { cratePriceCents: cratePriceCents ?? 0, paymentLink, paymentNote };
};

export const BeerPotSettingsFormSchema = BeerPotFieldsSchema.transform(potSettingsOf);

export const BeerPersonPotSettingsSchema = z.object({
  person: PersonRefSchema,
  settings: BeerPotSettingsSchema,
});
export type BeerPersonPotSettings = z.infer<typeof BeerPersonPotSettingsSchema>;

const personPotFormSchema = (missing: string): z.ZodType<BeerPersonPotSettings, BeerPotForm> =>
  BeerPotFieldsSchema.transform((form, ctx) => {
    const settings = potSettingsOf(form, ctx);

    if (form.person === null) {
      addIssue(ctx, 'person', missing);

      return z.NEVER;
    }

    return { person: form.person, settings };
  });

export const BeerPotOpeningFormSchema = personPotFormSchema(OWNER_MISSING);

export const BeerHandoverFormSchema = personPotFormSchema(SUCCESSOR_MISSING);
