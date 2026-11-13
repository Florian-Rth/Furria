import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import type { CaretAnchor } from '../rich-text-editor';
import type { MentionablesSource } from '../types';
import type { RichTextField } from './use-rich-text';

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

export const useMentionLayer = (text: RichTextField, source: MentionablesSource): MentionLayer => {
  const { picker, pickerAnchor, edited, editedElement } = text.mention;
  const target =
    edited === null ? null : (source.list.find((entry) => entry.id === edited.id) ?? null);
  const label = edited?.label ?? '';

  return {
    sections: source.sectionsOf(picker?.choices ?? []),
    pickerAnchor,
    activeId: picker?.activeId ?? null,
    editorAnchor: editedElement,
    label,
    targetName: target?.name ?? label,
    targetLine: target?.line ?? '',
    targetNote: edited !== null && target === null ? source.missingTargetNote : undefined,
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
