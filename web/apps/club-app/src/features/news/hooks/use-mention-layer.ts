import type { KkMentionSection } from '@furria/ui';
import { MENTION_BOARD, MENTION_GROUPS, MENTION_NOT_PUBLIC } from '../editor-copy';
import type { NewsMentionable } from '../types';
import type { ProseText } from './use-prose-text';

export interface MentionLayer {
  sections: readonly KkMentionSection[];
  target: NewsMentionable | null;
  targetNote: string | undefined;
}

const choiceOf = (mentionable: NewsMentionable): KkMentionSection['choices'][number] => ({
  id: mentionable.id,
  kind: mentionable.kind,
  name: mentionable.name,
  line: mentionable.line,
  initials: mentionable.initials,
  tone: mentionable.tone,
  pictureSource: mentionable.pictureSource,
});

export const useMentionLayer = (
  text: ProseText,
  mentionables: readonly NewsMentionable[],
): MentionLayer => {
  const groups = text.mentionChoices.filter((choice) => choice.kind === 'group').map(choiceOf);
  const board = text.mentionChoices.filter((choice) => choice.kind === 'person').map(choiceOf);
  const selected = text.selectedMention;
  const target =
    selected === null ? null : (mentionables.find((entry) => entry.id === selected.id) ?? null);

  return {
    sections: [
      { title: MENTION_GROUPS, choices: groups },
      { title: MENTION_BOARD, choices: board },
    ],
    target,
    targetNote: selected !== null && target === null ? MENTION_NOT_PUBLIC : undefined,
  };
};
