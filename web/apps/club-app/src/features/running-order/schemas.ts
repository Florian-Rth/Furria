import { z } from 'zod';
import { PictureSchema, PortraitPersonRefSchema } from '@/lib/api/schemas';
import { ClubIconSchema } from '@/lib/club-icon';
import { GroupToneSchema } from '@/lib/group-tone';

export const ACT_NAME_MAX_LENGTH = 80;

export const ACT_KINDS = ['dance', 'speech', 'music', 'show', 'point'] as const;
export const ActKindSchema = z.enum(ACT_KINDS);
export type ActKind = z.infer<typeof ActKindSchema>;

export const STRENGTHS = ['must', 'prefer'] as const;
export const StrengthSchema = z.enum(STRENGTHS);
export type Strength = z.infer<typeof StrengthSchema>;

export const ACT_WISH_KINDS = [
  'first',
  'last',
  'firstHalf',
  'secondHalf',
  'early',
  'late',
] as const;
export const ActWishKindSchema = z.enum(ACT_WISH_KINDS);
export type ActWishKind = z.infer<typeof ActWishKindSchema>;

export const RULE_KINDS = [...ACT_WISH_KINDS, 'before', 'after', 'apart', 'kindSpread'] as const;
export const RuleKindSchema = z.enum(RULE_KINDS);
export type RuleKind = z.infer<typeof RuleKindSchema>;

export const FINDING_KINDS = [
  'noChangeover',
  'tightChangeover',
  'mustRuleBroken',
  'preferRuleMissed',
  'sameKindAdjacent',
  'nobodyThere',
  'absences',
  'unplaced',
] as const;
export const FindingKindSchema = z.enum(FINDING_KINDS);
export type FindingKind = z.infer<typeof FindingKindSchema>;

export const SEVERITIES = ['conflict', 'hint'] as const;
export const SeveritySchema = z.enum(SEVERITIES);
export type Severity = z.infer<typeof SeveritySchema>;

export const ActGroupSchema = z.object({
  groupId: z.number().int(),
  name: z.string(),
  tone: GroupToneSchema.nullable(),
  icon: ClubIconSchema.nullable(),
  picture: PictureSchema.nullable(),
});
export type ActGroup = z.infer<typeof ActGroupSchema>;

export const ActRefSchema = z.object({
  actId: z.number().int(),
  name: z.string(),
  kind: ActKindSchema.nullable(),
  group: ActGroupSchema.nullable(),
});
export type ActRef = z.infer<typeof ActRefSchema>;

export const CastPersonSchema = PortraitPersonRefSchema.extend({ absent: z.boolean() });
export type CastPerson = z.infer<typeof CastPersonSchema>;

export const ActWishSchema = z.object({
  actWishId: z.number().int(),
  actId: z.number().int(),
  kind: ActWishKindSchema,
  strength: StrengthSchema,
});
export type ActWish = z.infer<typeof ActWishSchema>;

export const RuleSchema = z.object({
  ruleId: z.number().int(),
  kind: RuleKindSchema,
  strength: StrengthSchema,
  actId: z.number().int().nullable(),
  otherActId: z.number().int().nullable(),
  actKind: ActKindSchema.nullable(),
});
export type Rule = z.infer<typeof RuleSchema>;

export const FindingSchema = z.object({
  kind: FindingKindSchema,
  severity: SeveritySchema,
  lineIds: z.array(z.number().int()),
  personIds: z.array(z.number().int()),
  ruleId: z.number().int().nullable(),
  actWishId: z.number().int().nullable(),
});
export type Finding = z.infer<typeof FindingSchema>;

export const CatalogueActSchema = ActRefSchema.extend({
  sessionYear: z.number().int().nullable(),
  closed: z.boolean(),
  archived: z.boolean(),
  cast: z.array(CastPersonSchema),
  added: z.array(PortraitPersonRefSchema),
  removed: z.array(PortraitPersonRefSchema),
  wishes: z.array(ActWishSchema),
});
export type CatalogueAct = z.infer<typeof CatalogueActSchema>;

export const ActsResponseSchema = z.object({
  sessionYear: z.number().int(),
  sessionYears: z.array(z.number().int()),
  acts: z.array(CatalogueActSchema),
});
export type ActsResponse = z.infer<typeof ActsResponseSchema>;

export const ActWishBodySchema = z.object({ kind: ActWishKindSchema, strength: StrengthSchema });
export type ActWishBody = z.infer<typeof ActWishBodySchema>;

export const ActFormSchema = z.object({
  name: z.string().trim().min(1).max(ACT_NAME_MAX_LENGTH),
  groupId: z.number().int().nullable(),
  kind: ActKindSchema.nullable(),
  sessionYear: z.number().int().nullable(),
  addedPersonIds: z.array(z.number().int()),
  removedPersonIds: z.array(z.number().int()),
  wishes: z.array(ActWishBodySchema),
});
export type ActForm = z.infer<typeof ActFormSchema>;

export const CreatedActSchema = z.object({ actId: z.number().int() });
export type CreatedAct = z.infer<typeof CreatedActSchema>;

export const LineActSchema = ActRefSchema.extend({ cast: z.array(CastPersonSchema) });
export type LineAct = z.infer<typeof LineActSchema>;

export const EVENING_CHANGES = ['cast', 'spots', 'choreography'] as const;
export const EveningChangeSchema = z.enum(EVENING_CHANGES);
export type EveningChange = z.infer<typeof EveningChangeSchema>;

export const RunningOrderLineSchema = z.object({
  lineId: z.number().int(),
  act: LineActSchema,
  position: z.number().int().nonnegative().nullable(),
  pinned: z.boolean(),
  blockKey: z.number().int().nullable(),
  eveningChanges: z.array(EveningChangeSchema),
});
export type RunningOrderLine = z.infer<typeof RunningOrderLineSchema>;

export const EveningActWishSchema = ActWishSchema.extend({ suspended: z.boolean() });
export type EveningActWish = z.infer<typeof EveningActWishSchema>;

export const RunningOrderResponseSchema = z.object({
  eventId: z.number().int(),
  version: z.number().int(),
  confirmedAt: z.iso.datetime({ offset: true }).nullable(),
  changedSinceConfirmed: z.boolean(),
  lines: z.array(RunningOrderLineSchema),
  rules: z.array(RuleSchema),
  actWishes: z.array(EveningActWishSchema),
  findings: z.array(FindingSchema),
});
export type RunningOrderResponse = z.infer<typeof RunningOrderResponseSchema>;

export const LineBodySchema = z.object({
  actId: z.number().int(),
  position: z.number().int().nonnegative().nullable(),
  pinned: z.boolean(),
  blockKey: z.number().int().nullable(),
});
export type LineBody = z.infer<typeof LineBodySchema>;

export const RuleBodySchema = RuleSchema.omit({ ruleId: true });
export type RuleBody = z.infer<typeof RuleBodySchema>;

export const RunningOrderBodySchema = z.object({
  version: z.number().int().nullable(),
  lines: z.array(LineBodySchema),
  rules: z.array(RuleBodySchema),
  suspendedActWishIds: z.array(z.number().int()),
});
export type RunningOrderBody = z.infer<typeof RunningOrderBodySchema>;

export const LineKeySchema = z.templateLiteral(['act:', z.number().int()]);
export type LineKey = z.infer<typeof LineKeySchema>;

export const ResolvedFindingSchema = z.object({
  kind: FindingKindSchema,
  lineKeys: z.array(LineKeySchema),
});
export type ResolvedFinding = z.infer<typeof ResolvedFindingSchema>;

export const SuggestedMoveSchema = z.object({
  lineKey: LineKeySchema,
  from: z.number().int().nonnegative().nullable(),
  to: z.number().int().nonnegative(),
  resolved: z.array(ResolvedFindingSchema),
  roomFor: z.array(z.number().int()),
});
export type SuggestedMove = z.infer<typeof SuggestedMoveSchema>;

export const CostStepSchema = z.enum([
  'noChangeover',
  'tightChangeover',
  'mustRules',
  'preferRules',
  'sameKind',
  'unplaced',
  'changeoverRoom',
]);
export type CostStep = z.infer<typeof CostStepSchema>;

export const SuggestionStepCostSchema = z.object({
  step: CostStepSchema,
  before: z.number().int().nonnegative(),
  after: z.number().int().nonnegative(),
});
export type SuggestionStepCost = z.infer<typeof SuggestionStepCostSchema>;

export const HOLD_KINDS = ['pin', 'block', 'mustRule', 'mustWish'] as const;
export const HoldKindSchema = z.enum(HOLD_KINDS);
export type HoldKind = z.infer<typeof HoldKindSchema>;

export const SuggestionHoldSchema = z.object({
  kind: HoldKindSchema,
  lineKey: LineKeySchema.nullable(),
  blockKey: z.number().int().nullable(),
  ruleIndex: z.number().int().nonnegative().nullable(),
  actWishId: z.number().int().nullable(),
  conflictsWithout: z.number().int().nonnegative(),
});
export type SuggestionHold = z.infer<typeof SuggestionHoldSchema>;

export const SuggestionSchema = z.object({
  order: z.array(LineKeySchema),
  moves: z.array(SuggestedMoveSchema),
  conflictsBefore: z.number().int().nonnegative(),
  hintsBefore: z.number().int().nonnegative(),
  conflictsAfter: z.number().int().nonnegative(),
  hintsAfter: z.number().int().nonnegative(),
  costBefore: z.number().int().nonnegative(),
  costAfter: z.number().int().nonnegative(),
  roomBefore: z.number().int().nonnegative(),
  roomAfter: z.number().int().nonnegative(),
  steps: z.array(SuggestionStepCostSchema),
  proven: z.boolean(),
  holds: z.array(SuggestionHoldSchema),
  holdsUnavoidable: z.boolean(),
});
export type Suggestion = z.infer<typeof SuggestionSchema>;

export const ConfirmationBodySchema = z.object({ confirmed: z.boolean() });
export type ConfirmationBody = z.infer<typeof ConfirmationBodySchema>;

export const RunningOrderSummarySchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  actIds: z.array(z.number().int()),
});
export type RunningOrderSummary = z.infer<typeof RunningOrderSummarySchema>;

export const RunningOrdersResponseSchema = z.object({
  runningOrders: z.array(RunningOrderSummarySchema),
});
export type RunningOrdersResponse = z.infer<typeof RunningOrdersResponseSchema>;

export const PLANNER_MODES = ['pick', 'order', 'check'] as const;
export const PlannerModeSchema = z.enum(PLANNER_MODES);
export type PlannerMode = z.infer<typeof PlannerModeSchema>;

export const RunningOrderSearchSchema = z.object({
  mode: PlannerModeSchema.optional().catch(undefined),
});
export type RunningOrderSearch = z.infer<typeof RunningOrderSearchSchema>;
