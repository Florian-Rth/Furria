import type { z } from 'zod';
import { ContactFieldsFormSchema } from '@/lib/contact-fields';

export const ContactDetailsFormSchema = ContactFieldsFormSchema;
export type ContactDetailsForm = z.infer<typeof ContactDetailsFormSchema>;

export const CONTACT_DETAILS_FIELD_NAMES = ['email', 'phone', 'street', 'zip', 'city'] as const;
