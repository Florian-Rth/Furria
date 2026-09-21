import type { StateChip } from '@/lib/state-chips';
import type { TrainingPreviewRow, TrainingPreviewState, TrainingSlot } from './schemas';

const KEY_SEPARATOR = '@';
const COLLISION_SEPARATOR = ', ';
const NO_COLLISION_HOLDER = 'ein anderer Eintrag';
const CLUB_HOLDER = 'Verein';

const STATE_CHIPS: Record<TrainingPreviewState, StateChip> = {
  creatable: { label: 'neu', tone: 'green', dot: true },
  venueTaken: { label: 'Ort belegt', tone: 'gold', dot: true },
  alreadyExists: { label: 'steht schon', tone: 'neutral', dot: false },
};

export interface TrainingPreviewEntry {
  readonly key: string;
  readonly row: TrainingPreviewRow;
  readonly checked: boolean;
  readonly chip: StateChip;
  readonly dimmed: boolean;
}

export const toPreviewRowKey = (row: TrainingPreviewRow): string =>
  `${row.groupTrainingSlotId}${KEY_SEPARATOR}${row.startsAt}`;

export const toPreviewStateChip = (state: TrainingPreviewState): StateChip => STATE_CHIPS[state];

export const toDefaultTicked = (rows: readonly TrainingPreviewRow[]): ReadonlySet<string> =>
  new Set(rows.filter((row) => row.state !== 'alreadyExists').map((row) => toPreviewRowKey(row)));

export const toPreviewRows = (
  rows: readonly TrainingPreviewRow[],
  ticked: ReadonlySet<string>,
): readonly TrainingPreviewEntry[] =>
  rows.map((row) => {
    const key = toPreviewRowKey(row);

    return {
      key,
      row,
      checked: ticked.has(key),
      chip: toPreviewStateChip(row.state),
      dimmed: row.state === 'alreadyExists',
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

export const toCollisionOwner = (ownerGroupName: string | null): string =>
  ownerGroupName ?? CLUB_HOLDER;

export const toSlotKey = (slot: TrainingSlot): string => String(slot.groupTrainingSlotId);
