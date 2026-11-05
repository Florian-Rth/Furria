import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { AreaKind, DoorKind, TextSize } from '@/features/hall-plan/schemas';
import {
  AREA_KINDS,
  AreaKindSchema,
  DOOR_KINDS,
  DoorKindSchema,
  TEXT_SIZES,
  TextSizeSchema,
} from '@/features/hall-plan/schemas';
import {
  AREA_KIND_LABELS,
  DOOR_KIND_LABELS,
  PILLAR_SHAPE_LABELS,
  TEXT_SIZE_LABELS,
} from './hall-builder-copy';

export const AREA_KIND_OPTIONS: readonly KkSelectOption[] = AREA_KINDS.map((kind) => ({
  value: kind,
  label: AREA_KIND_LABELS[kind],
}));

export const DOOR_KIND_OPTIONS: readonly KkSelectOption[] = DOOR_KINDS.map((kind) => ({
  value: kind,
  label: DOOR_KIND_LABELS[kind],
}));

export const TEXT_SIZE_OPTIONS: readonly KkSelectOption[] = TEXT_SIZES.map((size) => ({
  value: size,
  label: TEXT_SIZE_LABELS[size],
}));

export const PILLAR_SHAPE_OPTIONS: readonly KkSelectOption[] = [
  { value: 'square', label: PILLAR_SHAPE_LABELS.square },
  { value: 'round', label: PILLAR_SHAPE_LABELS.round },
];

export const asAreaKind = (value: string): AreaKind | null =>
  AreaKindSchema.safeParse(value).data ?? null;

export const asDoorKind = (value: string): DoorKind | null =>
  DoorKindSchema.safeParse(value).data ?? null;

export const asTextSize = (value: string): TextSize | null =>
  TextSizeSchema.safeParse(value).data ?? null;
