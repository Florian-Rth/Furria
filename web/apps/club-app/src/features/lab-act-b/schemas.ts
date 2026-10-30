import { z } from 'zod';

export const AGENDA_VIEWS = ['mine', 'details'] as const;
export const AgendaViewSchema = z.enum(AGENDA_VIEWS);
export type AgendaView = z.infer<typeof AgendaViewSchema>;

export const AgendaSearchSchema = z.object({
  view: AgendaViewSchema.optional().catch(undefined),
});
export type AgendaSearch = z.infer<typeof AgendaSearchSchema>;
