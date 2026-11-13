import type { KkProseMentionTone } from '@furria/ui/KkProseField';
import type { MentionKind, RichTextInline } from '@furria/ui/rich-text';
import { mentionKeyOf, readRichText } from '@furria/ui/rich-text';
import type { Mentionable } from './types';

const mentionKeysIn = (inlines: readonly RichTextInline[]): string[] =>
  inlines.flatMap((inline) => (inline.kind === 'mention' ? [mentionKeyOf(inline.mention)] : []));

const mentionKeysOf = (text: string, kinds: readonly MentionKind[]): string[] =>
  readRichText(text, kinds).flatMap((block) =>
    block.kind === 'list' ? block.items.flatMap(mentionKeysIn) : mentionKeysIn(block.inlines),
  );

export const mentionTonesOf = (
  mentionables: readonly Mentionable[],
  text: string,
  kinds: readonly MentionKind[],
): KkProseMentionTone[] => {
  const known = new Set(mentionables.map((mentionable) => mentionable.id));
  const stale = [...new Set(mentionKeysOf(text, kinds))].filter((key) => !known.has(key));
  return [
    ...mentionables.map((mentionable) => ({
      id: mentionable.id,
      tone: mentionable.tone,
      isPublic: true,
    })),
    ...stale.map((id) => ({ id, tone: null, isPublic: false })),
  ];
};
