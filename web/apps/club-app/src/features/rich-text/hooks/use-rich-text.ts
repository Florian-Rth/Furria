import type { MentionKind } from '@furria/ui/rich-text';
import { useEffect, useEffectEvent, useState } from 'react';
import type { RichTextCommand } from '../rich-text-commands';
import type { CaretAnchor, RichTextEditor, RichTextFieldIdentity } from '../rich-text-editor';
import { createRichTextEditor } from '../rich-text-editor';
import type {
  RichTextEditedMention,
  RichTextMentionPicker,
  RichTextState,
  RichTextView,
} from '../rich-text-state';
import { openRichText, richTextViewOf } from '../rich-text-state';
import type { Mentionable } from '../types';

export interface RichTextMentionState {
  picker: RichTextMentionPicker | null;
  pickerAnchor: CaretAnchor | null;
  edited: RichTextEditedMention | null;
  editedElement: HTMLElement | null;
}

export interface RichTextField extends Omit<RichTextView, 'picker' | 'editedMention'> {
  hostRef: (node: HTMLDivElement | null) => void;
  mention: RichTextMentionState;
  pickerListId: string;
  run: (command: RichTextCommand) => boolean;
}

interface RichTextOptions extends RichTextFieldIdentity {
  text: string;
  isReadOnly: boolean;
  liveText?: string | null;
  changedMark?: string;
  mentionKinds: readonly MentionKind[];
  mentionables: readonly Mentionable[];
  onChange: (text: string) => void;
}

export const useRichText = ({
  text,
  isReadOnly,
  liveText = null,
  changedMark = '',
  mentionKinds,
  mentionables,
  fieldId,
  label,
  pickerListId,
  onChange,
}: RichTextOptions): RichTextField => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<RichTextEditor | null>(null);
  const [state, setState] = useState<RichTextState>(() => openRichText(text, mentionKinds));
  const emitChange = useEffectEvent(onChange);
  const openingText = useEffectEvent((): string => text);
  const openingKinds = useEffectEvent((): readonly MentionKind[] => mentionKinds);

  useEffect(() => {
    if (host === null) {
      return;
    }
    const created = createRichTextEditor(host, {
      text: openingText(),
      mentionKinds: openingKinds(),
      fieldId,
      label,
      pickerListId,
      onChange: (next) => {
        emitChange(next);
      },
      onState: setState,
    });
    setEditor(created);
    return () => {
      created.destroy();
      setEditor(null);
    };
  }, [host, fieldId, label, pickerListId]);

  useEffect(() => {
    editor?.showText(text);
  }, [editor, text]);

  useEffect(() => {
    editor?.setReadOnly(isReadOnly);
  }, [editor, isReadOnly]);

  useEffect(() => {
    editor?.settle({ mentionables, liveText, changedMark });
  }, [editor, mentionables, liveText, changedMark]);

  const { picker, editedMention, ...view } = richTextViewOf(state);
  const run = (command: RichTextCommand): boolean => editor?.run(command) ?? false;

  return {
    ...view,
    hostRef: setHost,
    pickerListId,
    mention: {
      picker,
      pickerAnchor: editor?.pickerAnchorOf(state) ?? null,
      edited: editedMention,
      editedElement: editor?.editedMentionElementOf(state) ?? null,
    },
    run,
  };
};
