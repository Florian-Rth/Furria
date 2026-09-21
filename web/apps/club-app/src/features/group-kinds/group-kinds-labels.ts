import type { KkSelectOption } from '@furria/ui';
import type { RunningGroupKind } from './schemas';

export const NO_GROUP_KIND_VALUE = '';
export const NO_GROUP_KIND_LABEL = 'Keine Gruppenart';

export const GROUP_KIND_FIELD_LABEL = 'Gruppenart';
export const GROUP_KIND_FIELD_HINT =
  'Die Art ordnet die Gruppe ein — Garde, Elferrat, Spielmannszug. Die Gruppenverwaltung pflegt die Liste.';

const ARCHIVED_SUFFIX = ' — archiviert';

export const toHeldGroupKind = (
  groupKindId: number | null,
  groupKindName: string | null,
): RunningGroupKind | null =>
  groupKindId === null || groupKindName === null ? null : { groupKindId, name: groupKindName };

export const toGroupKindOptions = (
  kinds: readonly RunningGroupKind[],
  held: RunningGroupKind | null,
): KkSelectOption[] => {
  const offered = kinds.map((kind) => ({ value: String(kind.groupKindId), label: kind.name }));

  if (held === null) {
    return [{ value: NO_GROUP_KIND_VALUE, label: NO_GROUP_KIND_LABEL }, ...offered];
  }

  const heldValue = String(held.groupKindId);
  const isOffered = offered.some((option) => option.value === heldValue);
  const kept = isOffered ? [] : [{ value: heldValue, label: `${held.name}${ARCHIVED_SUFFIX}` }];

  return [{ value: NO_GROUP_KIND_VALUE, label: NO_GROUP_KIND_LABEL }, ...offered, ...kept];
};

export const toGroupKindId = (value: string): number | null =>
  value === NO_GROUP_KIND_VALUE ? null : Number(value);

export const toGroupKindValue = (groupKindId: number | null): string =>
  groupKindId === null ? NO_GROUP_KIND_VALUE : String(groupKindId);
