import { useEffect, useEffectEvent, useState } from 'react';
import type {
  CaretAnchor,
  NewsTextCommand,
  NewsTextEditor,
  NewsTextMention,
  NewsTextMentionPicker,
  NewsTextState,
  NewsTextView,
} from '../news-text-editor';
import { createNewsTextEditor, newsTextViewOf, openNewsText } from '../news-text-editor';
import type { NewsMentionable } from '../types';

export interface ProseMention {
  picker: NewsTextMentionPicker | null;
  pickerAnchor: CaretAnchor | null;
  edited: NewsTextMention | null;
  editedElement: HTMLElement | null;
}

export interface ProseText extends Omit<NewsTextView, 'picker' | 'editedMention'> {
  hostRef: (node: HTMLDivElement | null) => void;
  mention: ProseMention;
  run: (command: NewsTextCommand) => boolean;
}

interface ProseTextOptions {
  text: string;
  isReadOnly: boolean;
  liveText: string | null;
  mentionables: readonly NewsMentionable[];
  pickerListId: string;
  onChange: (text: string) => void;
}

export const useProseText = ({
  text,
  isReadOnly,
  liveText,
  mentionables,
  pickerListId,
  onChange,
}: ProseTextOptions): ProseText => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [editor, setEditor] = useState<NewsTextEditor | null>(null);
  const [state, setState] = useState<NewsTextState>(() => openNewsText(text));
  const emitChange = useEffectEvent(onChange);
  const openingText = useEffectEvent((): string => text);

  useEffect(() => {
    if (host === null) {
      return;
    }
    const created = createNewsTextEditor(host, {
      text: openingText(),
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
  }, [host, pickerListId]);

  useEffect(() => {
    editor?.showText(text);
  }, [editor, text]);

  useEffect(() => {
    editor?.setReadOnly(isReadOnly);
  }, [editor, isReadOnly]);

  useEffect(() => {
    editor?.settle({ mentionables, liveText });
  }, [editor, mentionables, liveText]);

  const { picker, editedMention, ...view } = newsTextViewOf(state);
  const run = (command: NewsTextCommand): boolean => editor?.run(command) ?? false;

  return {
    ...view,
    hostRef: setHost,
    mention: {
      picker,
      pickerAnchor: editor?.pickerAnchorOf(state) ?? null,
      edited: editedMention,
      editedElement: editor?.editedMentionElementOf(state) ?? null,
    },
    run,
  };
};
