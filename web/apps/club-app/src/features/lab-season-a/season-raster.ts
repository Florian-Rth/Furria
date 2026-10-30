import type { CastTile } from '@/features/acts/act-cast';
import { castTilesOf } from '@/features/acts/act-cast';
import type { ActGroup } from '@/features/running-order/schemas';
import type { SeasonAct, SeasonAppearance } from '@/features/season/schemas';
import { readinessOf } from '@/features/season/season-grid';
import type { PortraitPersonRef } from '@/lib/api/schemas';

export type RasterOrder = 'group' | 'ready' | 'name';

export interface RasterGroupRow {
  kind: 'group';
  key: string;
  name: string | null;
  tone: ActGroup['tone'];
  count: number;
}

export interface RasterActRow {
  kind: 'act';
  key: string;
  act: SeasonAct;
  line: number;
}

export type RasterRow = RasterGroupRow | RasterActRow;

export interface RasterSpot {
  line: number;
  column: number;
}

export interface EveningTally {
  placed: number;
  tray: number;
}

export interface EveningCast {
  tiles: CastTile[];
  out: number;
  standIns: number;
}

const COLLATOR = new Intl.Collator('de-DE');
const UNGROUPED_KEY = 'group:none';

const byName = (left: SeasonAct, right: SeasonAct): number =>
  COLLATOR.compare(left.name, right.name);

const byReadiness = (left: SeasonAct, right: SeasonAct): number =>
  readinessOf(left).done - readinessOf(right).done || byName(left, right);

const groupKeyOf = (act: SeasonAct): string =>
  act.group === null ? UNGROUPED_KEY : `group:${act.group.groupId}`;

const byGroupName = (left: SeasonAct[], right: SeasonAct[]): number => {
  const leftGroup = left[0]?.group ?? null;
  const rightGroup = right[0]?.group ?? null;

  if (leftGroup === null || rightGroup === null) {
    return Number(leftGroup === null) - Number(rightGroup === null);
  }

  return COLLATOR.compare(leftGroup.name, rightGroup.name);
};

const numbered = (rows: readonly (RasterGroupRow | SeasonAct)[]): RasterRow[] => {
  let line = 0;

  return rows.map((row) => {
    if (!('actId' in row)) {
      return row;
    }

    const actRow: RasterActRow = { kind: 'act', key: `act:${row.actId}`, act: row, line };
    line += 1;

    return actRow;
  });
};

const groupedRowsOf = (acts: readonly SeasonAct[]): RasterRow[] => {
  const groups = new Map<string, SeasonAct[]>();

  for (const act of acts) {
    groups.set(groupKeyOf(act), [...(groups.get(groupKeyOf(act)) ?? []), act]);
  }

  return numbered(
    [...groups.entries()]
      .map(([key, members]) => [key, [...members].sort(byName)] as const)
      .sort(([, left], [, right]) => byGroupName(left, right))
      .flatMap(([key, members]) => {
        const group = members[0]?.group ?? null;
        const head: RasterGroupRow = {
          kind: 'group',
          key,
          name: group?.name ?? null,
          tone: group?.tone ?? null,
          count: members.length,
        };

        return [head, ...members];
      }),
  );
};

export const rasterRowsOf = (acts: readonly SeasonAct[], order: RasterOrder): RasterRow[] => {
  if (order === 'group') {
    return groupedRowsOf(acts);
  }

  return numbered([...acts].sort(order === 'ready' ? byReadiness : byName));
};

export const lineCountOf = (rows: readonly RasterRow[]): number =>
  rows.filter((row) => row.kind === 'act').length;

const clamp = (value: number, upper: number): number => Math.min(Math.max(value, 0), upper);

const SPOT_MOVES: Record<string, (spot: RasterSpot, lines: number, columns: number) => RasterSpot> =
  {
    ArrowUp: ({ line, column }) => ({ line: line - 1, column }),
    ArrowDown: ({ line, column }) => ({ line: line + 1, column }),
    ArrowLeft: ({ line, column }) => ({ line, column: column - 1 }),
    ArrowRight: ({ line, column }) => ({ line, column: column + 1 }),
    Home: ({ line }) => ({ line, column: 0 }),
    End: ({ line }, _lines, columns) => ({ line, column: columns - 1 }),
    PageUp: ({ column }) => ({ line: 0, column }),
    PageDown: ({ column }, lines) => ({ line: lines - 1, column }),
  };

export const movedSpotOf = (
  spot: RasterSpot,
  key: string,
  lines: number,
  columns: number,
): RasterSpot | null => {
  const move = SPOT_MOVES[key];

  if (move === undefined || lines === 0 || columns === 0) {
    return null;
  }

  const moved = move(spot, lines, columns);

  return { line: clamp(moved.line, lines - 1), column: clamp(moved.column, columns - 1) };
};

export const spotKeyOf = ({ line, column }: RasterSpot): string => `${line}:${column}`;

export const spotOfKey = (key: string | undefined): RasterSpot | null => {
  const [line, column] = (key ?? '').split(':').map(Number);

  return line === undefined || column === undefined || Number.isNaN(line) || Number.isNaN(column)
    ? null
    : { line, column };
};

export const eveningTallyOf = (acts: readonly SeasonAct[], eventId: number): EveningTally => {
  const appearances = acts.flatMap((act) =>
    act.appearances.filter((appearance) => appearance.eventId === eventId),
  );
  const tray = appearances.filter((appearance) => appearance.position === null).length;

  return { placed: appearances.length - tray, tray };
};

export const eveningCastOf = (
  sessionCast: readonly PortraitPersonRef[],
  appearance: SeasonAppearance | null,
): EveningCast => {
  const tiles = castTilesOf(
    sessionCast,
    {
      removedIds: (appearance?.removed ?? []).map((person) => person.personId),
      added: appearance?.added ?? [],
    },
    true,
  );

  return {
    tiles,
    out: tiles.filter((tile) => tile.state === 'out').length,
    standIns: tiles.filter((tile) => tile.state === 'guest').length,
  };
};

export const snappedColumnOf = (scrollLeft: number, scrollWidth: number, count: number): number =>
  count <= 0 || scrollWidth <= 0
    ? 0
    : clamp(Math.round(scrollLeft / (scrollWidth / count)), count - 1);
