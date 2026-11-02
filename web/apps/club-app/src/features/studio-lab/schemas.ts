import { z } from 'zod';

export const StudioLabLiftSchema = z.enum(['lifted', 'loupe']);
export type StudioLabLift = z.infer<typeof StudioLabLiftSchema>;

export const StudioLabPrecisionSchema = z.enum(['distance', 'hold']);
export type StudioLabPrecision = z.infer<typeof StudioLabPrecisionSchema>;

export const StudioLabSelectionSchema = z.enum(['sheet', 'toolbar']);
export type StudioLabSelection = z.infer<typeof StudioLabSelectionSchema>;

export const StudioLabGlideSchema = z.enum(['free', 'snap']);
export type StudioLabGlide = z.infer<typeof StudioLabGlideSchema>;

export const StudioLabSearchSchema = z.object({
  act: z.coerce.number().int().positive().optional().catch(undefined),
  lift: StudioLabLiftSchema.optional().catch(undefined),
  precision: StudioLabPrecisionSchema.optional().catch(undefined),
  selection: StudioLabSelectionSchema.optional().catch(undefined),
  glide: StudioLabGlideSchema.optional().catch(undefined),
});
export type StudioLabSearch = z.infer<typeof StudioLabSearchSchema>;

export interface StudioLabVariants {
  lift: StudioLabLift;
  precision: StudioLabPrecision;
  selection: StudioLabSelection;
  glide: StudioLabGlide;
}

export const studioLabVariantsOf = (search: StudioLabSearch): StudioLabVariants => ({
  lift: search.lift ?? 'lifted',
  precision: search.precision ?? 'distance',
  selection: search.selection ?? 'sheet',
  glide: search.glide ?? 'free',
});
