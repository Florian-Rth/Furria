import type { CalendarEntryKind } from '@/features/club/schemas';
import type { CalendarEntry, CalendarEntryForm } from './schemas';

export const CLUB_OWNER_ID = 'club';

export interface CalendarOwnerOption {
  id: string;
  ownerGroupId: number | null;
  label: string;
}

export type CalendarAudienceChoice = Pick<
  CalendarEntryForm,
  'audience' | 'audienceGroupIds' | 'audiencePersonIds'
>;

export interface HeldOwnership {
  choice: CalendarAudienceChoice;
  ownerId: string;
}

const sameIds = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((id) => right.includes(id));

const isHeldChoice = (choice: CalendarAudienceChoice, held: CalendarAudienceChoice): boolean =>
  choice.audience === held.audience &&
  sameIds(choice.audienceGroupIds, held.audienceGroupIds) &&
  sameIds(choice.audiencePersonIds, held.audiencePersonIds);

const keepsPreferred = (choice: CalendarAudienceChoice, preferredOwnerId: string): boolean =>
  choice.audience === 'people' || choice.audienceGroupIds.includes(preferredOwnerId);

export const toDerivedOwnerId = (
  choice: CalendarAudienceChoice,
  preferredOwnerId: string,
  options: readonly CalendarOwnerOption[],
  held: HeldOwnership | null,
): string => {
  if (held !== null && isHeldChoice(choice, held.choice)) {
    return held.ownerId;
  }
  if (choice.audience === 'club') {
    return CLUB_OWNER_ID;
  }

  const owns = (ownerId: string): boolean => options.some((option) => option.id === ownerId);
  const onlyGroupId = choice.audienceGroupIds.length === 1 ? choice.audienceGroupIds[0] : undefined;

  if (choice.audience === 'groups' && onlyGroupId !== undefined && owns(onlyGroupId)) {
    return onlyGroupId;
  }
  if (owns(CLUB_OWNER_ID)) {
    return CLUB_OWNER_ID;
  }
  if (owns(preferredOwnerId) && keepsPreferred(choice, preferredOwnerId)) {
    return preferredOwnerId;
  }

  return choice.audienceGroupIds.find(owns) ?? options[0]?.id ?? preferredOwnerId;
};

export const mayBeForTheClub = (kind: CalendarEntryKind): boolean => kind !== 'training';

export const toGroupsOfOwner = (ownerId: string): string[] =>
  ownerId === CLUB_OWNER_ID ? [] : [ownerId];

export const toChoiceForKind = (
  choice: CalendarAudienceChoice,
  kind: CalendarEntryKind,
  ownerId: string,
): CalendarAudienceChoice =>
  choice.audience === 'club' && !mayBeForTheClub(kind)
    ? { ...choice, audience: 'groups', audienceGroupIds: toGroupsOfOwner(ownerId) }
    : choice;

export const toHeldOwnership = (
  entry: Pick<
    CalendarEntry,
    'ownerGroupId' | 'audience' | 'audienceGroups' | 'audiencePeople'
  > | null,
): HeldOwnership | null =>
  entry === null
    ? null
    : {
        ownerId: entry.ownerGroupId === null ? CLUB_OWNER_ID : String(entry.ownerGroupId),
        choice: {
          audience: entry.audience,
          audienceGroupIds: entry.audienceGroups.map((group) => String(group.groupId)),
          audiencePersonIds: entry.audiencePeople.map((person) => String(person.personId)),
        },
      };
