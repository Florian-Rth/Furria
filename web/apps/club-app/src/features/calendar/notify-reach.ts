import type { CalendarParticipantPool } from './calendar-authoring';
import type { CalendarAddOnKind, CalendarEntryForm } from './schemas';

export type NotifyReach =
  | { readonly audience: 'club'; readonly asks: boolean }
  | { readonly audience: 'groups'; readonly groupNames: readonly string[]; readonly asks: boolean }
  | { readonly audience: 'people'; readonly count: number; readonly asks: boolean };

export interface NotifySwitch {
  checked: boolean;
  set: (checked: boolean) => void;
}

const ASKING_KINDS: ReadonlySet<CalendarAddOnKind> = new Set(['attendance', 'poll', 'signUpList']);

const toGroupNames = (groupIds: readonly string[], pool: CalendarParticipantPool): string[] =>
  pool.state === 'failed'
    ? []
    : pool.groups
        .filter((group) => groupIds.includes(String(group.groupId)))
        .map((group) => group.name)
        .sort((left, right) => left.localeCompare(right, 'de'));

type NotifiedChoices = Pick<
  CalendarEntryForm,
  'audience' | 'audienceGroupIds' | 'audiencePersonIds'
> & { addOns: readonly { kind: CalendarAddOnKind }[] };

export const toNotifyReach = (
  form: NotifiedChoices,
  groups: CalendarParticipantPool,
): NotifyReach => {
  const asks = form.addOns.some((card) => ASKING_KINDS.has(card.kind));

  switch (form.audience) {
    case 'club':
      return { audience: 'club', asks };
    case 'groups':
      return { audience: 'groups', groupNames: toGroupNames(form.audienceGroupIds, groups), asks };
    case 'people':
      return { audience: 'people', count: new Set(form.audiencePersonIds).size, asks };
  }
};
