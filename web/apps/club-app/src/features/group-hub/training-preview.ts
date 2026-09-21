import type { StateChip } from '@/lib/state-chips';
import type { TrainingPreviewRow, TrainingPreviewState } from './schemas';

const KEY_SEPARATOR = '@';
const COLLISION_SEPARATOR = ', ';
const NO_COLLISION_HOLDER = 'ein anderer Eintrag';

const STATE_CHIPS: Record<TrainingPreviewState, StateChip> = {
  creatable: { label: 'neu', tone: 'green', dot: true },
  venueTaken: { label: 'Ort belegt', tone: 'gold', dot: true },
  alreadyExists: { label: 'steht schon', tone: 'neutral', dot: false },
  venueArchived: { label: 'Ort archiviert', tone: 'gold', dot: false },
};

export interface TrainingPreviewEntry {
  readonly key: string;
  readonly row: TrainingPreviewRow;
  readonly checked: boolean;
  readonly chip: StateChip;
  readonly dimmed: boolean;
  readonly blocked: boolean;
}

export const isTickable = (state: TrainingPreviewState): boolean =>
  state === 'creatable' || state === 'venueTaken';

export const toPreviewRowKey = (row: TrainingPreviewRow): string =>
  `${row.groupTrainingSlotId}${KEY_SEPARATOR}${row.startsAt}`;

export const toPreviewStateChip = (state: TrainingPreviewState): StateChip => STATE_CHIPS[state];

export const toDefaultTicked = (rows: readonly TrainingPreviewRow[]): ReadonlySet<string> =>
  new Set(rows.filter((row) => isTickable(row.state)).map((row) => toPreviewRowKey(row)));

export const toPreviewRows = (
  rows: readonly TrainingPreviewRow[],
  ticked: ReadonlySet<string>,
): readonly TrainingPreviewEntry[] =>
  rows.map((row) => {
    const key = toPreviewRowKey(row);

    const blocked = !isTickable(row.state);

    return {
      key,
      row,
      checked: ticked.has(key) && !blocked,
      chip: toPreviewStateChip(row.state),
      dimmed: row.state === 'alreadyExists',
      blocked,
    };
  });

export const toTickedCount = (entries: readonly TrainingPreviewEntry[]): number =>
  entries.filter((entry) => entry.checked).length;

export const toPreviewSummary = (entries: readonly TrainingPreviewEntry[]): string => {
  const ticked = toTickedCount(entries);

  if (entries.length === 0) {
    return 'Es gibt nichts zu planen.';
  }
  if (ticked === 0) {
    return 'Nichts angehakt — es entsteht kein Termin.';
  }
  if (ticked === 1) {
    return '1 Training entsteht.';
  }

  return `${ticked} Trainings entstehen.`;
};

export const toTickedInstants = (
  entries: readonly TrainingPreviewEntry[],
): readonly { groupTrainingSlotId: number; startsAt: string }[] =>
  entries
    .filter((entry) => entry.checked)
    .map((entry) => ({
      groupTrainingSlotId: entry.row.groupTrainingSlotId,
      startsAt: entry.row.startsAt,
    }));

export const toTickedAll = (entries: readonly TrainingPreviewEntry[]): ReadonlySet<string> =>
  new Set(entries.filter((entry) => !entry.blocked).map((entry) => entry.key));

export const toToggledTicks = (ticked: ReadonlySet<string>, key: string): ReadonlySet<string> => {
  const next = new Set(ticked);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
};

export const toCollisionLine = (row: TrainingPreviewRow): string | null => {
  if (row.venueCollisions.length === 0) {
    return null;
  }

  const holders = row.venueCollisions.map((collision) => collision.title);

  return `${row.venueName ?? NO_COLLISION_HOLDER} ist belegt: ${holders.join(COLLISION_SEPARATOR)}`;
};
