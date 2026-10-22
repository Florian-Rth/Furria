import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import { MENTION_BOARD, MENTION_GROUPS, MENTION_NOT_PUBLIC } from '../editor-copy';
import type { CaretAnchor } from '../news-text-editor';
import type { NewsMentionable } from '../types';
import type { ProseText } from './use-prose-text';

export interface MentionLayer {
  sections: readonly KkMentionSection[];
  pickerAnchor: CaretAnchor | null;
  activeId: string | null;
  editorAnchor: HTMLElement | null;
  label: string;
  targetName: string;
  targetLine: string;
  targetNote: string | undefined;
  choose: (id: string) => void;
  relabel: (label: string) => void;
  remove: () => void;
  close: () => void;
}

const choiceOf = (mentionable: NewsMentionable): KkMentionSection['choices'][number] => ({
  id: mentionable.id,
  kind: mentionable.kind,
  name: mentionable.name,
  line: mentionable.line,
  initials: mentionable.initials,
  tone: mentionable.tone,
  image: mentionable.image,
});

export const useMentionLayer = (
  text: ProseText,
  mentionables: readonly NewsMentionable[],
): MentionLayer => {
  const { picker, pickerAnchor, edited, editedElement } = text.mention;
  const choices = picker?.choices ?? [];
  const groups = choices.filter((choice) => choice.kind === 'group').map(choiceOf);
  const board = choices.filter((choice) => choice.kind === 'person').map(choiceOf);
  const target =
    edited === null ? null : (mentionables.find((entry) => entry.id === edited.id) ?? null);
  const label = edited?.label ?? '';

  return {
    sections: [
      { title: MENTION_GROUPS, choices: groups },
      { title: MENTION_BOARD, choices: board },
    ],
    pickerAnchor,
    activeId: picker?.activeId ?? null,
    editorAnchor: editedElement,
    label,
    targetName: target?.name ?? label,
    targetLine: target?.line ?? '',
    targetNote: edited !== null && target === null ? MENTION_NOT_PUBLIC : undefined,
    choose: (id) => {
      text.run({ kind: 'choose-mention', id });
    },
    relabel: (next) => {
      text.run({ kind: 'relabel-mention', label: next });
    },
    remove: () => {
      text.run({ kind: 'remove-mention' });
    },
    close: () => {
      text.run({ kind: 'close-mention' });
    },
  };
};
