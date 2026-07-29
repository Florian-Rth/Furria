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
    id: 'stage',
    role: 'weighted',
    prompt: 'Wenn das Licht angeht und der Saal kurz still wird, will ich da oben stehen.',
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
    id: 'choreography',
    role: 'weighted',
    prompt: 'Eine Schrittfolge so lange üben, bis der Körper sie allein kann: genau mein Ding.',
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
    id: 'laughter',
    role: 'weighted',
    prompt: 'Wenn der ganze Saal über mich lacht, habe ich alles richtig gemacht.',
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
    id: 'microphone',
    role: 'weighted',
    prompt:
      'Elf Minuten Redezeit, ein Mikrofon und ein voller Saal: klingt nach einem guten Abend.',
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
    id: 'solo',
    role: 'weighted',
    prompt:
      'Lieber allein oben stehen als in einer Reihe, in der alle gleichzeitig das Bein heben.',
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
    id: 'uniform',
    role: 'weighted',
    prompt: 'Uniform, blank geputzte Stiefel, gerader Rücken — das hat für mich Stil.',
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
    id: 'ritual',
    role: 'weighted',
    prompt: 'Orden verleihen, „Gross - Furria!“ rufen, feste Abläufe: das ist der Kern der Sache.',
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
    id: 'bursts',
    role: 'weighted',
    prompt:
      'Jede Woche verlässlich da sein schaffe ich nicht — dafür vor der Sitzung ein ganzes Wochenende.',
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
    id: 'build-day',
    role: 'weighted',
    prompt: 'Bierbänke schleppen, Kabel verlegen, Kaffee aus der Kanne: guter Samstag.',
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
    id: 'costume',
    role: 'weighted',
    prompt: 'Je alberner das Kostüm, desto besser.',
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
