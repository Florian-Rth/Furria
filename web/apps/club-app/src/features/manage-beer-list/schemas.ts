import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';
import type { BeerDrinkLimit, BeerPaymentDrinkRow } from './beer-hub';
import {
  centsOfPriceText,
  countOfText,
  DRINK_NAME_MAX,
  paidDrinksOf,
  STOCK_MAX_CRATES,
  signedCountOfText,
  stockChangeOf,
  textOrNull,
} from './beer-hub';
import {
  countRangeOf,
  DRINK_MISSING,
  DRINK_NAME_MISSING,
  DRINK_NAME_TOO_LONG,
  DRINK_NAME_TWICE,
  DRINKS_MISSING,
  OWNER_MISSING,
  PAYMENT_EMPTY,
  PERSON_MISSING,
  PRICE_INVALID,
  STOCK_CEILING,
  STOCK_CHANGE_MISSING,
  SUCCESSOR_MISSING,
  stockFloorOf,
} from './beer-hub-copy';

export const BeerStockChangeSchema = z.object({
  kind: z.enum(['delivery', 'correction']),
  crates: z.number().int(),
});
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
  beerDrinkId: z.number().int(),
  drinkName: z.string(),
  kind: BeerMovementKindSchema,
  crates: z.number().int(),
  bookedAt: z.iso.datetime({ offset: true }),
  bookedBy: PersonRefSchema.nullable(),
});
export type BeerMovement = z.infer<typeof BeerMovementSchema>;

export const BeerForecastSchema = z.object({
  paceWindowDays: z.number().int(),
  cratesTakenInPaceWindow: z.number().int(),
  projectedEmptyOn: z.iso.date().nullable(),
});
export type BeerForecast = z.infer<typeof BeerForecastSchema>;

export const BeerStockDrinkSchema = z.object({
  beerDrinkId: z.number().int(),
  name: z.string(),
  cratePriceCents: z.number().int(),
  isRetired: z.boolean(),
  isDefault: z.boolean(),
  crates: z.number().int(),
  forecast: BeerForecastSchema,
});
export type BeerStockDrink = z.infer<typeof BeerStockDrinkSchema>;

export const BeerStockResponseSchema = z.object({
  drinks: z.array(BeerStockDrinkSchema),
  movements: z.array(BeerMovementSchema),
});
export type BeerStockResponse = z.infer<typeof BeerStockResponseSchema>;

export const BeerPaymentDrinkSchema = z.object({
  beerDrinkId: z.number().int(),
  name: z.string(),
  crates: z.number().int(),
});
export type BeerPaymentDrink = z.infer<typeof BeerPaymentDrinkSchema>;

export const BeerTabPaymentSchema = z.object({
  beerPaymentId: z.number().int(),
  crates: z.number().int(),
  drinks: z.array(BeerPaymentDrinkSchema),
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
  beerDrinkId: z.number().int(),
  drinkName: z.string(),
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
  drinks: z.array(BeerPaymentDrinkSchema),
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

export const BeerDrinkCreatedSchema = z.object({ beerDrinkId: z.number().int() });

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

export const BeerPotSettingsSchema = z.object({ paymentLink: z.string().nullable() });
export type BeerPotSettings = z.infer<typeof BeerPotSettingsSchema>;

export const BeerNewDrinkSchema = z.object({
  name: z.string(),
  cratePriceCents: z.number().int().positive(),
});
export type BeerNewDrink = z.infer<typeof BeerNewDrinkSchema>;

export const BeerDrinkPriceSchema = z.object({
  beerDrinkId: z.number().int(),
  cratePriceCents: z.number().int().positive(),
});
export type BeerDrinkPrice = z.infer<typeof BeerDrinkPriceSchema>;

type IssueContext = z.RefinementCtx;

const addIssue = (ctx: IssueContext, field: string, message: string): void => {
  ctx.addIssue({ code: 'custom', message, path: [field] });
};

const addPathIssue = (
  ctx: IssueContext,
  path: readonly (string | number)[],
  message: string,
): void => {
  ctx.addIssue({ code: 'custom', message, path: [...path] });
};

const BeerStockFieldsSchema = z.object({ beerDrinkId: z.string(), crates: z.string() });
export type BeerStockForm = z.infer<typeof BeerStockFieldsSchema>;

export const BeerStockBookingSchema = z.object({
  beerDrinkId: z.number().int(),
  change: BeerStockChangeSchema,
});
export type BeerStockBooking = z.infer<typeof BeerStockBookingSchema>;

export interface BeerDrinkStock {
  beerDrinkId: number;
  crates: number;
}

export const beerStockFormSchema = (
  stocks: readonly BeerDrinkStock[],
): z.ZodType<BeerStockBooking, BeerStockForm> =>
  BeerStockFieldsSchema.transform((form, ctx) => {
    const beerDrinkId = Number(form.beerDrinkId);
    const stock = stocks.find((candidate) => candidate.beerDrinkId === beerDrinkId);
    const change = stockChangeOf(signedCountOfText(form.crates));

    if (form.beerDrinkId === '' || stock === undefined) {
      addIssue(ctx, 'beerDrinkId', DRINK_MISSING);

      return z.NEVER;
    }
    if (change === null) {
      addIssue(ctx, 'crates', STOCK_CHANGE_MISSING);

      return z.NEVER;
    }
    if (Math.abs(change.crates) > STOCK_MAX_CRATES) {
      addIssue(ctx, 'crates', STOCK_CEILING);

      return z.NEVER;
    }
    if (stock.crates + change.crates < 0) {
      addIssue(ctx, 'crates', stockFloorOf(stock.crates));

      return z.NEVER;
    }

    return { beerDrinkId, change };
  });

const countWithin = (text: string, max: number, ctx: IssueContext, field: string): number => {
  const count = countOfText(text);

  if (count < 1 || count > max) {
    addIssue(ctx, field, countRangeOf(max));
  }

  return count;
};

export const BeerPaymentPickSchema = z.object({
  beerDrinkId: z.number().int(),
  crates: z.number().int(),
});
export type BeerPaymentPick = z.infer<typeof BeerPaymentPickSchema>;

const BeerPaymentFieldsSchema = z.object({ drinks: z.array(BeerPaymentPickSchema) });
export type BeerPaymentForm = z.infer<typeof BeerPaymentFieldsSchema>;

export const beerPaymentFormSchema = (
  rows: readonly BeerPaymentDrinkRow[],
): z.ZodType<readonly BeerPaymentPick[], BeerPaymentForm> =>
  BeerPaymentFieldsSchema.transform((form, ctx) => {
    const drinks = paidDrinksOf(rows, form.drinks);

    if (drinks.length === 0) {
      addIssue(ctx, 'drinks', PAYMENT_EMPTY);

      return z.NEVER;
    }

    return drinks;
  });

const BeerCratesFieldsSchema = z.object({
  personId: z.string(),
  beerDrinkId: z.string(),
  count: z.string(),
  paid: z.boolean(),
});
export type BeerCratesForm = z.infer<typeof BeerCratesFieldsSchema>;

export const BeerCratesBookingSchema = z.object({
  personId: z.number().int(),
  beerDrinkId: z.number().int(),
  count: z.number().int(),
  paid: z.boolean(),
});
export type BeerCratesBooking = z.infer<typeof BeerCratesBookingSchema>;

export const beerCratesFormSchema = (
  personIds: readonly number[],
  drinkLimits: readonly BeerDrinkLimit[],
): z.ZodType<BeerCratesBooking, BeerCratesForm> =>
  BeerCratesFieldsSchema.transform((form, ctx) => {
    const personId = Number(form.personId);
    const beerDrinkId = Number(form.beerDrinkId);
    const limit = drinkLimits.find((candidate) => candidate.beerDrinkId === beerDrinkId);

    if (form.personId === '' || !personIds.includes(personId)) {
      addIssue(ctx, 'personId', PERSON_MISSING);
    }
    if (form.beerDrinkId === '' || limit === undefined) {
      addIssue(ctx, 'beerDrinkId', DRINK_MISSING);

      return z.NEVER;
    }

    const count = countWithin(form.count, limit.maxCount, ctx, 'count');

    return { personId, beerDrinkId, count, paid: form.paid };
  });

const BeerDrinkFieldsSchema = z.object({ name: z.string(), price: z.string() });
export type BeerDrinkForm = z.infer<typeof BeerDrinkFieldsSchema>;

const drinkNameOf = (text: string): string => text.trim().replace(/\s+/g, ' ');

const newDrinkOf = (
  form: BeerDrinkForm,
  ctx: IssueContext,
  path: readonly (string | number)[],
): BeerNewDrink => {
  const name = drinkNameOf(form.name);
  const cratePriceCents = centsOfPriceText(form.price);

  if (name === '') {
    addPathIssue(ctx, [...path, 'name'], DRINK_NAME_MISSING);
  } else if (name.length > DRINK_NAME_MAX) {
    addPathIssue(ctx, [...path, 'name'], DRINK_NAME_TOO_LONG);
  }
  if (cratePriceCents === null) {
    addPathIssue(ctx, [...path, 'price'], PRICE_INVALID);
  }

  return { name, cratePriceCents: cratePriceCents ?? 0 };
};

export const BeerDrinkFormSchema = BeerDrinkFieldsSchema.transform((form, ctx) =>
  newDrinkOf(form, ctx, []),
);

const BeerDrinkRowSchema = z.object({
  beerDrinkId: z.number().int().nullable(),
  name: z.string(),
  price: z.string(),
});
export type BeerDrinkRow = z.infer<typeof BeerDrinkRowSchema>;

const BeerPotFieldsSchema = z.object({
  person: PersonRefSchema.nullable(),
  paymentLink: z.string(),
  drinks: z.array(BeerDrinkRowSchema),
});
export type BeerPotForm = z.infer<typeof BeerPotFieldsSchema>;

export const BeerPotSettingsFormSchema = BeerPotFieldsSchema.transform(
  (form): BeerPotSettings => ({ paymentLink: textOrNull(form.paymentLink) }),
);

export const BeerPotOpeningSchema = z.object({
  person: PersonRefSchema,
  paymentLink: z.string().nullable(),
  drinks: z.array(BeerNewDrinkSchema),
});
export type BeerPotOpening = z.infer<typeof BeerPotOpeningSchema>;

const newDrinksOf = (rows: readonly BeerDrinkRow[], ctx: IssueContext): BeerNewDrink[] => {
  if (rows.length === 0) {
    addIssue(ctx, 'drinks', DRINKS_MISSING);
  }

  const drinks = rows.map((row, index) => newDrinkOf(row, ctx, ['drinks', index]));
  const seen = new Set<string>();

  drinks.forEach((drink, index) => {
    const key = drink.name.toLocaleLowerCase('de');

    if (key !== '' && seen.has(key)) {
      addPathIssue(ctx, ['drinks', index, 'name'], DRINK_NAME_TWICE);
    }
    seen.add(key);
  });

  return drinks;
};

export const BeerPotOpeningFormSchema: z.ZodType<BeerPotOpening, BeerPotForm> =
  BeerPotFieldsSchema.transform((form, ctx) => {
    const drinks = newDrinksOf(form.drinks, ctx);

    if (form.person === null) {
      addIssue(ctx, 'person', OWNER_MISSING);

      return z.NEVER;
    }

    return { person: form.person, paymentLink: textOrNull(form.paymentLink), drinks };
  });

export const BeerPotHandoverSchema = z.object({
  person: PersonRefSchema,
  paymentLink: z.string().nullable(),
  drinks: z.array(BeerDrinkPriceSchema),
});
export type BeerPotHandover = z.infer<typeof BeerPotHandoverSchema>;

const drinkPricesOf = (rows: readonly BeerDrinkRow[], ctx: IssueContext): BeerDrinkPrice[] =>
  rows.map((row, index) => {
    const cratePriceCents = centsOfPriceText(row.price);

    if (cratePriceCents === null) {
      addPathIssue(ctx, ['drinks', index, 'price'], PRICE_INVALID);
    }

    return { beerDrinkId: row.beerDrinkId ?? 0, cratePriceCents: cratePriceCents ?? 0 };
  });

export const BeerHandoverFormSchema: z.ZodType<BeerPotHandover, BeerPotForm> =
  BeerPotFieldsSchema.transform((form, ctx) => {
    const drinks = drinkPricesOf(form.drinks, ctx);

    if (form.person === null) {
      addIssue(ctx, 'person', SUCCESSOR_MISSING);

      return z.NEVER;
    }

    return { person: form.person, paymentLink: textOrNull(form.paymentLink), drinks };
  });
