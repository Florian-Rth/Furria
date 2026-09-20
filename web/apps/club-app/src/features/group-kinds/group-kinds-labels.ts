import type { KkSelectOption } from '@furria/ui';
import type { RunningGroupKind } from './schemas';

export const NO_GROUP_KIND_VALUE = '';
export const NO_GROUP_KIND_LABEL = 'Keine Gruppenart';

export const GROUP_KIND_FIELD_LABEL = 'Gruppenart';
export const GROUP_KIND_FIELD_HINT =
  'Die Art ordnet die Gruppe ein — Garde, Elferrat, Spielmannszug. Die Gruppenverwaltung pflegt die Liste.';

export const toGroupKindOptions = (kinds: readonly RunningGroupKind[]): KkSelectOption[] => {
  const offered = kinds
    .map((kind) => ({ value: String(kind.groupKindId), label: kind.name }))
    .sort((left, right) => left.label.localeCompare(right.label, 'de'));

  return [{ value: NO_GROUP_KIND_VALUE, label: NO_GROUP_KIND_LABEL }, ...offered];
};

export const toGroupKindId = (value: string): number | null =>
  value === NO_GROUP_KIND_VALUE ? null : Number(value);

export const toGroupKindValue = (groupKindId: number | null): string =>
  groupKindId === null ? NO_GROUP_KIND_VALUE : String(groupKindId);
