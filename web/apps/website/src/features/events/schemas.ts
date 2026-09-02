import { z } from 'zod';
import { FIRST_ORDER_FLOW_STEP, LAST_ORDER_FLOW_STEP } from './order-flow-steps';

export const OrderFlowSearchSchema = z.object({
  step: z.coerce
    .number()
    .int()
    .min(FIRST_ORDER_FLOW_STEP)
    .max(LAST_ORDER_FLOW_STEP)
    .optional()
    .catch(undefined),
});

export type OrderFlowSearch = z.infer<typeof OrderFlowSearchSchema>;

export const BUYER_NAME_MAX_LENGTH = 80;

export const BUYER_EMAIL_MAX_LENGTH = 254;

export const OrderBuyerFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Bitte trag deinen Vornamen ein.')
    .max(BUYER_NAME_MAX_LENGTH, 'Das sind mehr Zeichen, als wir speichern können.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Bitte trag deinen Nachnamen ein.')
    .max(BUYER_NAME_MAX_LENGTH, 'Das sind mehr Zeichen, als wir speichern können.'),
  email: z
    .string()
    .trim()
    .max(BUYER_EMAIL_MAX_LENGTH, 'Das sind mehr Zeichen, als eine E-Mail-Adresse haben darf.')
    .pipe(z.email('Bitte trag eine E-Mail-Adresse ein, an die deine Bestellung gehen kann.')),
});

export type OrderBuyerForm = z.infer<typeof OrderBuyerFormSchema>;

export const EMPTY_ORDER_BUYER: OrderBuyerForm = {
  firstName: '',
  lastName: '',
  email: '',
};
