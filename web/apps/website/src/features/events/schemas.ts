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
