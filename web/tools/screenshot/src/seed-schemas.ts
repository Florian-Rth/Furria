import { z } from 'zod';

const PersonIdSchema = z.object({ personId: z.number().int() });

export const LoginResponseSchema = z.object({ accessToken: z.string() });
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const AccessStateSchema = z.enum(['none', 'invited', 'active', 'disabled', 'notInvitable']);
export type AccessState = z.infer<typeof AccessStateSchema>;

const PersonContactSchema = z.object({
  email: z.string().nullable(),
  phone: z.string().nullable(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  birthDate: z.iso.date().nullable(),
  contactVisibleToMembers: z.boolean(),
});

export const PersonSummarySchema = z
  .object({
    personId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    accessState: AccessStateSchema,
  })
  .extend(PersonContactSchema.shape);
export type PersonSummary = z.infer<typeof PersonSummarySchema>;

export const PersonsSchema = z.object({ persons: z.array(PersonSummarySchema) });

export const PersonDetailSchema = z
  .object({
    personId: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
    contactChange: z.object({ changedBy: PersonIdSchema }).nullable(),
    memberships: z.array(
      z.object({
        membershipId: z.number().int(),
        startedOn: z.iso.date(),
        endedOn: z.iso.date().nullable(),
      }),
    ),
  })
  .extend(PersonContactSchema.shape);
export type PersonDetail = z.infer<typeof PersonDetailSchema>;

export const ManagedGroupsSchema = z.object({
  groups: z.array(z.object({ groupId: z.number().int(), name: z.string() })),
  kinds: z.array(z.object({ groupKindId: z.number().int(), name: z.string() })),
});

export const GroupDetailSchema = z.object({
  members: z.array(PersonIdSchema),
  pastMembers: z.array(PersonIdSchema),
  admins: z.array(PersonIdSchema),
  pastAdmins: z.array(PersonIdSchema),
});
export type GroupDetail = z.infer<typeof GroupDetailSchema>;

export const VenuesSchema = z.object({
  venues: z.array(z.object({ venueId: z.number().int(), name: z.string() })),
});

export const KeyHoldingsSchema = z.object({
  venues: z.array(
    z.object({
      venueId: z.number().int(),
      holdings: z.array(PersonIdSchema.extend({ untilOn: z.iso.date().nullable() })),
    }),
  ),
});

export const RolesSchema = z.object({
  roles: z.array(z.object({ roleId: z.number().int(), name: z.string() })),
});

export const BoardSchema = z.object({
  offices: z.array(
    z.object({
      boardOfficeId: z.number().int(),
      name: z.string(),
      seats: z.array(PersonIdSchema),
    }),
  ),
});

export const AnnouncementsSchema = z.object({
  announcements: z.array(z.object({ announcementId: z.number().int(), title: z.string() })),
});

export const CalendarEntriesSchema = z.object({
  entries: z.array(
    z.object({
      calendarEntryId: z.number().int(),
      title: z.string(),
      ownerGroupId: z.number().int().nullable(),
    }),
  ),
});

export const CreatedGroupKindSchema = z.object({ groupKindId: z.number().int() });
export const CreatedGroupSchema = z.object({ groupId: z.number().int() });
export const CreatedVenueSchema = z.object({ venueId: z.number().int() });
export const CreatedRoleSchema = z.object({ roleId: z.number().int() });
export const CreatedBoardOfficeSchema = z.object({ boardOfficeId: z.number().int() });
export const CreatedPersonSchema = PersonIdSchema;
export const CreatedCalendarEntrySchema = z.object({ calendarEntryId: z.number().int() });

export const RedemptionSchema = z.object({ outcome: z.string() });

export const MailSummarySchema = z.object({
  ID: z.string(),
  Created: z.iso.datetime({ offset: true }),
});
export type MailSummary = z.infer<typeof MailSummarySchema>;

export const MailSearchSchema = z.object({ messages: z.array(MailSummarySchema) });

export const MailMessageSchema = z.object({ Text: z.string() });
