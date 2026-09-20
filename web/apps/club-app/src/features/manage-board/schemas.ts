import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

const NAME_REQUIRED_MESSAGE = 'Gib der Vorstandsfunktion einen Namen.';
const NAME_TOO_LONG_MESSAGE = 'Der Name darf höchstens 80 Zeichen haben.';
const SORT_ORDER_MESSAGE = 'Der Platz im Vorstand ist eine Zahl zwischen 1 und 999.';
const SORT_ORDER_PATTERN = /^(?:[1-9]|[1-9]\d|[1-9]\d\d)$/;

export const BoardSeatSchema = PersonRefSchema.extend({
  boardSeatId: z.number().int(),
  sinceOn: z.iso.date(),
  untilOn: z.iso.date().nullable(),
});
export type BoardSeat = z.infer<typeof BoardSeatSchema>;

export const BoardOfficeSchema = z.object({
  boardOfficeId: z.number().int(),
  name: z.string(),
  sortOrder: z.number().int(),
  impliedRoleId: z.number().int().nullable(),
  impliedRoleName: z.string().nullable(),
  archivedOn: z.iso.date().nullable(),
  seats: z.array(BoardSeatSchema),
  pastSeats: z.array(BoardSeatSchema),
});
export type BoardOffice = z.infer<typeof BoardOfficeSchema>;

export const BoardResponseSchema = z.object({ offices: z.array(BoardOfficeSchema) });
export type BoardResponse = z.infer<typeof BoardResponseSchema>;

export const ImpliedRoleOptionSchema = z.object({
  roleId: z.number().int(),
  name: z.string(),
  archivedOn: z.iso.date().nullable(),
});
export type ImpliedRoleOption = z.infer<typeof ImpliedRoleOptionSchema>;

export const ImpliedRoleOptionsSchema = z.object({
  roles: z.array(ImpliedRoleOptionSchema),
});
export type ImpliedRoleOptions = z.infer<typeof ImpliedRoleOptionsSchema>;

export const CreatedBoardOfficeSchema = z.object({ boardOfficeId: z.number().int() });
export type CreatedBoardOffice = z.infer<typeof CreatedBoardOfficeSchema>;

export const CreatedBoardSeatSchema = z.object({ boardSeatId: z.number().int() });
export type CreatedBoardSeat = z.infer<typeof CreatedBoardSeatSchema>;

export const BoardOfficeFormSchema = z.object({
  name: z.string().trim().min(1, NAME_REQUIRED_MESSAGE).max(80, NAME_TOO_LONG_MESSAGE),
  sortOrder: z.string().trim().regex(SORT_ORDER_PATTERN, SORT_ORDER_MESSAGE),
});
export type BoardOfficeForm = z.infer<typeof BoardOfficeFormSchema>;

export const OpenBoardSeatFormSchema = z.object({
  personId: z.number().int().positive(),
  sinceOn: z.iso.date(),
});
export type OpenBoardSeatForm = z.infer<typeof OpenBoardSeatFormSchema>;

export const EndBoardSeatFormSchema = z.object({
  boardSeatId: z.number().int().positive(),
  endedOn: z.iso.date(),
});
export type EndBoardSeatForm = z.infer<typeof EndBoardSeatFormSchema>;
