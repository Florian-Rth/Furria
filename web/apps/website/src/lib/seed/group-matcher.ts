import { z } from 'zod';
import { GroupSchema, SEEDED_GROUPS } from './groups';

export const StanceSchema = z.enum(['yes', 'neutral', 'no']);

export type Stance = z.infer<typeof StanceSchema>;

export const ImportanceSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export type Importance = z.infer<typeof ImportanceSchema>;

export const WeightedPositionSchema = z.object({
  groupId: z.string().min(1),
  stance: StanceSchema,
  importance: ImportanceSchema,
});

export type WeightedPosition = z.infer<typeof WeightedPositionSchema>;

export const WeightedQuestionSchema = z.object({
  id: z.string().min(1),
  role: z.literal('weighted'),
  prompt: z.string().min(1),
  positions: z.array(WeightedPositionSchema).min(1),
});

export type WeightedQuestion = z.infer<typeof WeightedQuestionSchema>;

export const FilterOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});

export type FilterOption = z.infer<typeof FilterOptionSchema>;

export const FilterPositionSchema = z.object({
  groupId: z.string().min(1),
  accepts: z.array(z.string().min(1)).min(1),
});

export const FilterQuestionSchema = z.object({
  id: z.string().min(1),
  role: z.literal('filter'),
  prompt: z.string().min(1),
  options: z.array(FilterOptionSchema).min(2),
  positions: z.array(FilterPositionSchema).min(1),
});

export type FilterQuestion = z.infer<typeof FilterQuestionSchema>;

export const MatcherQuestionSchema = z.discriminatedUnion('role', [
  WeightedQuestionSchema,
  FilterQuestionSchema,
]);

export type MatcherQuestion = z.infer<typeof MatcherQuestionSchema>;

export const GroupMatcherSchema = z.object({
  groups: z.array(GroupSchema).min(1),
  questions: z.array(MatcherQuestionSchema).min(1),
});

export type GroupMatcher = z.infer<typeof GroupMatcherSchema>;

const questionsPayload = [
  {
    id: 'age-band',
    role: 'filter',
    prompt: 'Wie alt bist du?',
    options: [
      { id: 'under-12', label: 'unter 12' },
      { id: '12-13', label: '12 bis 13' },
      { id: '14-15', label: '14 bis 15' },
      { id: '16-17', label: '16 bis 17' },
      { id: '18-plus', label: '18 oder älter' },
    ],
    positions: [
      { groupId: 'tanzgarde', accepts: ['12-13', '14-15', '16-17', '18-plus'] },
      { groupId: 'maennerballett', accepts: ['16-17', '18-plus'] },
      { groupId: 'elferrat', accepts: ['18-plus'] },
      { groupId: 'buettenrede', accepts: ['14-15', '16-17', '18-plus'] },
      { groupId: 'kindergarde', accepts: ['under-12'] },
      { groupId: 'organisation', accepts: ['14-15', '16-17', '18-plus'] },
    ],
  },
  {
    id: 'confetti-hearing',
    role: 'weighted',
    prompt: 'Ich erkenne Konfetti mit verbundenen Augen am Geräusch.',
    positions: [
      { groupId: 'tanzgarde', stance: 'yes', importance: 3 },
      { groupId: 'maennerballett', stance: 'yes', importance: 3 },
      { groupId: 'elferrat', stance: 'yes', importance: 2 },
      { groupId: 'buettenrede', stance: 'yes', importance: 3 },
      { groupId: 'kindergarde', stance: 'yes', importance: 3 },
      { groupId: 'organisation', stance: 'no', importance: 3 },
    ],
  },
  {
    id: 'legs-versus-head',
    role: 'weighted',
    prompt: 'Meine Beine merken sich Schrittfolgen schneller als mein Kopf Telefonnummern.',
    positions: [
      { groupId: 'tanzgarde', stance: 'yes', importance: 3 },
      { groupId: 'maennerballett', stance: 'yes', importance: 2 },
      { groupId: 'elferrat', stance: 'no', importance: 2 },
      { groupId: 'buettenrede', stance: 'no', importance: 2 },
      { groupId: 'kindergarde', stance: 'yes', importance: 3 },
      { groupId: 'organisation', stance: 'no', importance: 2 },
    ],
  },
  {
    id: 'unexplained-laughter',
    role: 'weighted',
    prompt: 'Ich lache am liebsten über Witze, die ich nicht verstanden habe.',
    positions: [
      { groupId: 'tanzgarde', stance: 'no', importance: 2 },
      { groupId: 'maennerballett', stance: 'yes', importance: 3 },
      { groupId: 'elferrat', stance: 'neutral', importance: 2 },
      { groupId: 'buettenrede', stance: 'yes', importance: 3 },
      { groupId: 'kindergarde', stance: 'neutral', importance: 1 },
      { groupId: 'organisation', stance: 'neutral', importance: 1 },
    ],
  },
  {
    id: 'elf-minutes-breath',
    role: 'weighted',
    prompt: 'Elf Minuten reden, ohne Luft zu holen — rein organisatorisch machbar.',
    positions: [
      { groupId: 'tanzgarde', stance: 'no', importance: 2 },
      { groupId: 'maennerballett', stance: 'no', importance: 1 },
      { groupId: 'elferrat', stance: 'yes', importance: 2 },
      { groupId: 'buettenrede', stance: 'yes', importance: 3 },
      { groupId: 'kindergarde', stance: 'no', importance: 2 },
      { groupId: 'organisation', stance: 'no', importance: 1 },
    ],
  },
  {
    id: 'curtain-conversation',
    role: 'weighted',
    prompt: 'Steh ich allein auf der Bühne, fängt der Vorhang ein Gespräch an.',
    positions: [
      { groupId: 'tanzgarde', stance: 'no', importance: 3 },
      { groupId: 'maennerballett', stance: 'no', importance: 2 },
      { groupId: 'elferrat', stance: 'no', importance: 2 },
      { groupId: 'buettenrede', stance: 'yes', importance: 3 },
      { groupId: 'kindergarde', stance: 'no', importance: 2 },
      { groupId: 'organisation', stance: 'neutral', importance: 1 },
    ],
  },
  {
    id: 'humming-uniform',
    role: 'weighted',
    prompt: 'Eine Uniform sitzt richtig, wenn sie beim Gehen leise Marschmusik macht.',
    positions: [
      { groupId: 'tanzgarde', stance: 'yes', importance: 3 },
      { groupId: 'maennerballett', stance: 'no', importance: 2 },
      { groupId: 'elferrat', stance: 'yes', importance: 3 },
      { groupId: 'buettenrede', stance: 'neutral', importance: 1 },
      { groupId: 'kindergarde', stance: 'yes', importance: 2 },
      { groupId: 'organisation', stance: 'neutral', importance: 1 },
    ],
  },
  {
    id: 'orden-gravity',
    role: 'weighted',
    prompt: 'Ein Orden wird schwerer, je länger man ihn trägt. Physik interessiert mich da nicht.',
    positions: [
      { groupId: 'tanzgarde', stance: 'neutral', importance: 1 },
      { groupId: 'maennerballett', stance: 'no', importance: 2 },
      { groupId: 'elferrat', stance: 'yes', importance: 3 },
      { groupId: 'buettenrede', stance: 'yes', importance: 1 },
      { groupId: 'kindergarde', stance: 'neutral', importance: 1 },
      { groupId: 'organisation', stance: 'no', importance: 1 },
    ],
  },
  {
    id: 'reverse-planning',
    role: 'weighted',
    prompt: 'Feste plane ich rückwärts: erst das Aufräumen, dann die Musik.',
    positions: [
      { groupId: 'tanzgarde', stance: 'no', importance: 3 },
      { groupId: 'maennerballett', stance: 'no', importance: 1 },
      { groupId: 'elferrat', stance: 'neutral', importance: 1 },
      { groupId: 'buettenrede', stance: 'yes', importance: 2 },
      { groupId: 'kindergarde', stance: 'no', importance: 2 },
      { groupId: 'organisation', stance: 'yes', importance: 3 },
    ],
  },
  {
    id: 'bench-taxonomy',
    role: 'weighted',
    prompt: 'Ich kann eine Bierbank auf elf Arten falsch aufstellen — alle elf kenne ich.',
    positions: [
      { groupId: 'tanzgarde', stance: 'neutral', importance: 1 },
      { groupId: 'maennerballett', stance: 'yes', importance: 1 },
      { groupId: 'elferrat', stance: 'neutral', importance: 1 },
      { groupId: 'buettenrede', stance: 'no', importance: 1 },
      { groupId: 'kindergarde', stance: 'no', importance: 2 },
      { groupId: 'organisation', stance: 'yes', importance: 3 },
    ],
  },
  {
    id: 'mirror-test',
    role: 'weighted',
    prompt: 'Ein Kostüm ist gelungen, wenn mich mein eigener Spiegel nicht wiedererkennt.',
    positions: [
      { groupId: 'tanzgarde', stance: 'no', importance: 2 },
      { groupId: 'maennerballett', stance: 'yes', importance: 3 },
      { groupId: 'elferrat', stance: 'no', importance: 2 },
      { groupId: 'buettenrede', stance: 'yes', importance: 1 },
      { groupId: 'kindergarde', stance: 'yes', importance: 1 },
      { groupId: 'organisation', stance: 'neutral', importance: 1 },
    ],
  },
];

export const SEEDED_GROUP_MATCHER: GroupMatcher = GroupMatcherSchema.parse({
  groups: SEEDED_GROUPS,
  questions: questionsPayload,
});
