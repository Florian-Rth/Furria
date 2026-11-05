import { z } from 'zod';
import { AppSearchSchema } from '@/features/session/schemas';

export const LabStockStateSchema = z.enum(['real', 'warn', 'still', 'long']);
export type LabStockState = z.infer<typeof LabStockStateSchema>;

export const StockChartLabSearchSchema = AppSearchSchema.extend({
  state: LabStockStateSchema.optional().catch(undefined),
});
export type StockChartLabSearch = z.infer<typeof StockChartLabSearchSchema>;
