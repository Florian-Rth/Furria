import { z } from 'zod';

const EMAIL_MAX = 256;
const PHONE_MAX = 64;
const STREET_MAX = 256;
const ZIP_MAX = 16;
const CITY_MAX = 128;

const isEmailOrEmpty = (value: string): boolean =>
  value === '' || z.email().safeParse(value).success;

export const ContactDetailsFormSchema = z.object({
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX)
    .refine(isEmailOrEmpty, { message: 'Bitte gib eine gültige E-Mail-Adresse ein.' }),
  phone: z.string().trim().max(PHONE_MAX),
  street: z.string().trim().max(STREET_MAX),
  zip: z.string().trim().max(ZIP_MAX),
  city: z.string().trim().max(CITY_MAX),
});
export type ContactDetailsForm = z.infer<typeof ContactDetailsFormSchema>;

export const CONTACT_DETAILS_FIELD_NAMES = ['email', 'phone', 'street', 'zip', 'city'] as const;
