import type { MentionTarget } from '@furria/ui/rich-text';
import { mentionKeyOf } from '@furria/ui/rich-text';
import type { MentionedGroup, MentionedPerson } from './schemas';

export type MentionCard =
  | { kind: 'group'; group: MentionedGroup }
  | { kind: 'person'; person: MentionedPerson };

export type MentionCards = ReadonlyMap<string, MentionCard>;

const cardTargetOf = (card: MentionCard): MentionTarget =>
  card.kind === 'group'
    ? { kind: 'group', id: card.group.groupId }
    : { kind: 'person', id: card.person.personId };

export const mentionCardsOf = (cards: readonly MentionCard[]): MentionCards =>
  new Map(cards.map((card) => [mentionKeyOf(cardTargetOf(card)), card]));

export const mentionCardOf = (target: MentionTarget, cards: MentionCards): MentionCard | null =>
  cards.get(mentionKeyOf(target)) ?? null;
