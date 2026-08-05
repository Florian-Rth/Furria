import type { MembershipApplicationForm, MembershipApplicationPayload } from './schemas';

const orNull = (value: string): string | null => (value.length === 0 ? null : value);

export const buildMembershipApplicationPayload = (
  values: MembershipApplicationForm,
  requiresGuardian: boolean,
): MembershipApplicationPayload => ({
  firstName: values.firstName,
  lastName: values.lastName,
  birthDate: values.birthDate,
  street: values.street,
  postalCode: values.postalCode,
  city: values.city,
  email: values.email,
  phone: orNull(values.phone),
  groupInterests: values.groupInterests,
  guardian: requiresGuardian
    ? {
        name: values.guardianName,
        email: orNull(values.guardianEmail),
        phone: orNull(values.guardianPhone),
      }
    : null,
  consentAccepted: values.consent,
});
