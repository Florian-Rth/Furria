import { z } from 'zod';

export const NUMBER_MAX_LENGTH = 8;
export const NOTE_MAX_LENGTH = 500;
export const LABEL_MAX_LENGTH = 60;
export const TEXT_MAX_LENGTH = 120;
export const ROW_COUNT_MIN = 1;
export const ROW_COUNT_MAX = 50;

export const PointSchema = z.object({ x: z.number(), y: z.number() });
export type Point = z.infer<typeof PointSchema>;

export const DOOR_KINDS = ['entrance', 'emergencyExit', 'door'] as const;
export const DoorKindSchema = z.enum(DOOR_KINDS);
export type DoorKind = z.infer<typeof DoorKindSchema>;

export const AREA_KINDS = [
  'stage',
  'bar',
  'technics',
  'wardrobe',
  'toilets',
  'kitchen',
  'other',
] as const;
export const AreaKindSchema = z.enum(AREA_KINDS);
export type AreaKind = z.infer<typeof AreaKindSchema>;

export const TEXT_SIZES = ['small', 'medium', 'large'] as const;
export const TextSizeSchema = z.enum(TEXT_SIZES);
export type TextSize = z.infer<typeof TextSizeSchema>;

export const WallElementSchema = z.object({
  id: z.string(),
  kind: z.literal('wall'),
  points: z.array(PointSchema),
  thicknessCm: z.number(),
});
export type WallElement = z.infer<typeof WallElementSchema>;

export const DoorElementSchema = z.object({
  id: z.string(),
  kind: z.literal('door'),
  from: PointSchema,
  to: PointSchema,
  door: DoorKindSchema,
});
export type DoorElement = z.infer<typeof DoorElementSchema>;

export const AreaElementSchema = z.object({
  id: z.string(),
  kind: z.literal('area'),
  area: AreaKindSchema,
  x: z.number(),
  y: z.number(),
  widthCm: z.number(),
  heightCm: z.number(),
  rotation: z.number(),
  label: z.string().nullable(),
});
export type AreaElement = z.infer<typeof AreaElementSchema>;

export const PillarElementSchema = z.object({
  id: z.string(),
  kind: z.literal('pillar'),
  x: z.number(),
  y: z.number(),
  widthCm: z.number(),
  heightCm: z.number(),
  round: z.boolean(),
});
export type PillarElement = z.infer<typeof PillarElementSchema>;

export const LineElementSchema = z.object({
  id: z.string(),
  kind: z.literal('line'),
  points: z.array(PointSchema),
  label: z.string().nullable(),
});
export type LineElement = z.infer<typeof LineElementSchema>;

export const TextElementSchema = z.object({
  id: z.string(),
  kind: z.literal('text'),
  x: z.number(),
  y: z.number(),
  text: z.string(),
  size: TextSizeSchema,
  rotation: z.number(),
});
export type TextElement = z.infer<typeof TextElementSchema>;

export const HallElementSchema = z.discriminatedUnion('kind', [
  WallElementSchema,
  DoorElementSchema,
  AreaElementSchema,
  PillarElementSchema,
  LineElementSchema,
  TextElementSchema,
]);
export type HallElement = z.infer<typeof HallElementSchema>;
export type HallElementKind = HallElement['kind'];

export const HallDocumentSchema = z.object({ elements: z.array(HallElementSchema) });
export type HallDocument = z.infer<typeof HallDocumentSchema>;

export const SEATINGS = ['comfortable', 'maximum'] as const;
export const SeatingSchema = z.enum(SEATINGS);
export type Seating = z.infer<typeof SeatingSchema>;

export const RECT_SIDES = ['front', 'back', 'start', 'end'] as const;
export const RectSideSchema = z.enum(RECT_SIDES);
export type RectSide = z.infer<typeof RectSideSchema>;

export const CHAIR_SIDES = [...RECT_SIDES, 'around'] as const;
export const ChairSideSchema = z.enum(CHAIR_SIDES);
export type ChairSide = z.infer<typeof ChairSideSchema>;

export const RowSidesSchema = z.object({
  front: z.boolean(),
  back: z.boolean(),
  start: z.boolean(),
  end: z.boolean(),
});
export type RowSides = z.infer<typeof RowSidesSchema>;

export const ChairOverrideSchema = z.object({
  side: ChairSideSchema,
  index: z.number().int(),
  number: z.string().nullable(),
  note: z.string().nullable(),
  removed: z.boolean(),
});
export type ChairOverride = z.infer<typeof ChairOverrideSchema>;

export const TableRowSchema = z.object({
  id: z.string(),
  tableTypeId: z.number().int(),
  count: z.number().int(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  seating: SeatingSchema.nullable(),
  groupId: z.string().nullable(),
  sides: RowSidesSchema,
  number: z.string().nullable(),
  note: z.string().nullable(),
  chairs: z.array(ChairOverrideSchema),
});
export type TableRow = z.infer<typeof TableRowSchema>;

export const TableGroupSchema = z.object({
  id: z.string(),
  number: z.string().nullable(),
  note: z.string().nullable(),
});
export type TableGroup = z.infer<typeof TableGroupSchema>;

export const TablePlanDocumentSchema = z.object({
  seating: SeatingSchema,
  rows: z.array(TableRowSchema),
  groups: z.array(TableGroupSchema),
});
export type TablePlanDocument = z.infer<typeof TablePlanDocumentSchema>;

export const TABLE_SHAPES = ['rectangle', 'round'] as const;
export const TableShapeSchema = z.enum(TABLE_SHAPES);
export type TableShape = z.infer<typeof TableShapeSchema>;

export const TableTypeSchema = z.object({
  tableTypeId: z.number().int(),
  name: z.string(),
  shape: TableShapeSchema,
  lengthCm: z.number(),
  widthCm: z.number(),
  seatsAtEnds: z.boolean(),
  archived: z.boolean(),
});
export type TableType = z.infer<typeof TableTypeSchema>;

export const SeatingStandardSchema = z.object({
  comfortableChairSpacingCm: z.number(),
  maximumChairSpacingCm: z.number(),
  chairDepthCm: z.number(),
  aisleWidthCm: z.number(),
  exitClearanceCm: z.number(),
});
export type SeatingStandard = z.infer<typeof SeatingStandardSchema>;

export const SeatingResponseSchema = z.object({
  standard: SeatingStandardSchema,
  tableTypes: z.array(TableTypeSchema),
});
export type SeatingResponse = z.infer<typeof SeatingResponseSchema>;

export const TableTypeFormSchema = z.object({
  name: z.string().trim().min(1).max(LABEL_MAX_LENGTH),
  shape: TableShapeSchema,
  lengthCm: z.number().int().min(30).max(1000),
  widthCm: z.number().int().min(30).max(500),
  seatsAtEnds: z.boolean(),
});
export type TableTypeForm = z.infer<typeof TableTypeFormSchema>;

export const CreatedTableTypeSchema = z.object({ tableTypeId: z.number().int() });
export type CreatedTableType = z.infer<typeof CreatedTableTypeSchema>;

export const HallSummarySchema = z.object({
  hallId: z.number().int(),
  venueId: z.number().int(),
  venueName: z.string(),
  name: z.string(),
  updatedAt: z.string(),
});
export type HallSummary = z.infer<typeof HallSummarySchema>;

export const HallsResponseSchema = z.object({ halls: z.array(HallSummarySchema) });
export type HallsResponse = z.infer<typeof HallsResponseSchema>;

export const HallDetailsSchema = z.object({
  hallId: z.number().int(),
  venueId: z.number().int(),
  venueName: z.string(),
  name: z.string(),
  document: HallDocumentSchema,
  version: z.number().int(),
});
export type HallDetails = z.infer<typeof HallDetailsSchema>;

export const CreatedHallSchema = z.object({ hallId: z.number().int() });
export type CreatedHall = z.infer<typeof CreatedHallSchema>;

export const HallCreationSchema = z.object({ venueId: z.number().int(), name: z.string() });
export type HallCreation = z.infer<typeof HallCreationSchema>;

export const HallSaveSchema = z.object({
  name: z.string(),
  document: HallDocumentSchema,
  version: z.number().int(),
});
export type HallSave = z.infer<typeof HallSaveSchema>;

export const SavedVersionSchema = z.object({ version: z.number().int() });
export type SavedVersion = z.infer<typeof SavedVersionSchema>;

export const TablePlanSummarySchema = z.object({
  eventId: z.number().int(),
  title: z.string(),
  startsAt: z.string(),
  hallId: z.number().int(),
  hallName: z.string(),
  tables: z.number().int(),
});
export type TablePlanSummary = z.infer<typeof TablePlanSummarySchema>;

export const TablePlansResponseSchema = z.object({ plans: z.array(TablePlanSummarySchema) });
export type TablePlansResponse = z.infer<typeof TablePlansResponseSchema>;

export const TablePlanResponseSchema = z.object({
  eventId: z.number().int(),
  hallId: z.number().int(),
  document: TablePlanDocumentSchema,
  version: z.number().int(),
  hall: HallDetailsSchema,
});
export type TablePlanResponse = z.infer<typeof TablePlanResponseSchema>;

export const TablePlanCreationSchema = z.object({
  hallId: z.number().int(),
  copyFromEventId: z.number().int().nullable(),
});
export type TablePlanCreation = z.infer<typeof TablePlanCreationSchema>;

export const TablePlanSaveSchema = z.object({
  hallId: z.number().int(),
  document: TablePlanDocumentSchema,
  version: z.number().int(),
});
export type TablePlanSave = z.infer<typeof TablePlanSaveSchema>;

export const EMPTY_HALL_DOCUMENT: HallDocument = { elements: [] };

export const EMPTY_TABLE_PLAN_DOCUMENT: TablePlanDocument = {
  seating: 'comfortable',
  rows: [],
  groups: [],
};
