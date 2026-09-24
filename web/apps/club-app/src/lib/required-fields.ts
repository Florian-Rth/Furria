import { z } from 'zod';
import { PersonRefSchema } from '@/lib/api/schemas';

type RequiredDaySchema = z.ZodPipe<z.ZodNullable<z.ZodISODate>, z.ZodISODate>;
type RequiredSessionYearSchema = z.ZodPipe<z.ZodNullable<z.ZodNumber>, z.ZodNumber>;
type PersonRefObjectSchema = typeof PersonRefSchema;
type RequiredPersonSchema = z.ZodPipe<z.ZodNullable<PersonRefObjectSchema>, PersonRefObjectSchema>;

export const requiredDay = (message: string): RequiredDaySchema =>
  z.iso
    .date()
    .nullable()
    .pipe(z.iso.date({ error: message }));

export const requiredSessionYear = (message: string): RequiredSessionYearSchema =>
  z
    .number()
    .int()
    .nullable()
    .pipe(z.number({ error: message }).int());

export const requiredPerson = (message: string): RequiredPersonSchema =>
  PersonRefSchema.nullable().pipe(z.object(PersonRefSchema.shape, { error: message }));
