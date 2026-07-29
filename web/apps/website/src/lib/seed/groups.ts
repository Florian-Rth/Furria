import { z } from 'zod';

export const AgeRangeSchema = z.object({
  from: z.number().int().nonnegative(),
  to: z.number().int().nonnegative().nullable(),
});

export type AgeRange = z.infer<typeof AgeRangeSchema>;

export const GroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  ageRange: AgeRangeSchema,
  isRecruiting: z.boolean(),
  tagline: z.string().min(1),
});

export type Group = z.infer<typeof GroupSchema>;

export const GroupsSchema = z.array(GroupSchema);

const groupsPayload = [
  {
    id: 'tanzgarde',
    name: 'Tanzgarde',
    ageRange: { from: 12, to: null },
    isRecruiting: true,
    tagline: 'Tanzen in Uniform: Choreografie einstudieren, Auftritte die ganze Session lang.',
  },
  {
    id: 'maennerballett',
    name: 'Männerballett',
    ageRange: { from: 16, to: null },
    isRecruiting: true,
    tagline: 'Tanz mit voller Überzeugung und ohne Vorkenntnisse — Selbstironie hilft.',
  },
  {
    id: 'elferrat',
    name: 'Elferrat',
    ageRange: { from: 18, to: null },
    isRecruiting: false,
    tagline: 'Die Sitzung tragen: ansagen, Orden verleihen, Haltung bewahren.',
  },
  {
    id: 'buettenrede',
    name: 'Büttenrede',
    ageRange: { from: 14, to: null },
    isRecruiting: true,
    tagline: 'Ein Mikrofon, ein Reim, der sitzt — und ein Saal, der mitgeht.',
  },
  {
    id: 'kindergarde',
    name: 'Kindergarde',
    ageRange: { from: 6, to: 11 },
    isRecruiting: true,
    tagline: 'Tanzen ab sechs: erste Choreografie, erster Applaus, Eltern im Publikum.',
  },
  {
    id: 'organisation',
    name: 'Organisation',
    ageRange: { from: 14, to: null },
    isRecruiting: true,
    tagline: 'Alles außer Bühne: Aufbau, Getränke, Kasse — ohne die läuft kein Abend.',
  },
];

export const SEEDED_GROUPS: Group[] = GroupsSchema.parse(groupsPayload);
