import type { KkClubIcon, KkGroupTone, KkIconName, KkStartTileCoinTone } from '@furria/ui';
import { toGroupTone } from '@/features/groups';
import type { PersonFunction } from '@/lib/api/schemas';
import type { StartMine, StartMineKind } from './schemas';

export interface MineCoin {
  icon: KkIconName;
  glyph: KkClubIcon | undefined;
  tone: KkStartTileCoinTone;
  groupTone: KkGroupTone | undefined;
}

const COIN_FACES: Record<StartMineKind, { icon: KkIconName; tone: KkStartTileCoinTone }> = {
  newRole: { icon: 'role', tone: 'ink' },
  newBoardSeat: { icon: 'board', tone: 'ink' },
  newGroupAdmin: { icon: 'group', tone: 'ink' },
  newGroupMembership: { icon: 'group', tone: 'ink' },
  newKey: { icon: 'key', tone: 'ink' },
  contactChangedByOther: { icon: 'person', tone: 'blue' },
  membershipEnding: { icon: 'alert', tone: 'gold' },
  membershipPaused: { icon: 'info', tone: 'blue' },
  milestone: { icon: 'birthday', tone: 'gold' },
};

const FUNCTION_KINDS: Partial<Record<StartMineKind, PersonFunction['kind']>> = {
  newRole: 'role',
  newBoardSeat: 'boardSeat',
  newGroupAdmin: 'groupAdmin',
};

const GROUP_KINDS: ReadonlySet<StartMineKind> = new Set(['newGroupAdmin', 'newGroupMembership']);

const heldFunctionOf = (
  mine: StartMine,
  functions: readonly PersonFunction[],
): PersonFunction | null => {
  const kind = FUNCTION_KINDS[mine.kind];

  if (kind === undefined || mine.name === null) {
    return null;
  }

  return functions.find((held) => held.kind === kind && held.name === mine.name) ?? null;
};

const groupToneOf = (mine: StartMine): KkGroupTone | undefined =>
  GROUP_KINDS.has(mine.kind) && mine.subjectId !== null
    ? toGroupTone(mine.subjectId, mine.groupTone)
    : undefined;

export const toMineCoin = (mine: StartMine, functions: readonly PersonFunction[]): MineCoin => {
  const face = COIN_FACES[mine.kind];
  const held = heldFunctionOf(mine, functions);

  return {
    ...face,
    glyph: held?.icon ?? undefined,
    groupTone: held?.tone ?? groupToneOf(mine),
  };
};

export const tileFactsOf = (mine: readonly StartMine[]): StartMine[] =>
  mine.filter((item) => item.kind !== 'milestone');

export const needsAttention = (mine: readonly StartMine[]): boolean =>
  mine.some((item) => item.kind === 'membershipEnding');
