import { kkMentionOptionId } from '@furria/ui';
import type { Command, Transaction } from 'prosemirror-state';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { useEffect, useRef, useState } from 'react';
import { newsDocOf, newsTextOf } from '@/lib/news-prose';
import { TEXT_FIELD_LABEL } from '../editor-copy';
import { mentionChoicesOf, steppedIndexOf } from '../mention-choices';
import { CHANGED_MARK } from '../news-copy';
import { textBlocksOf } from '../news-lifecycle';
import type { MentionQuery, PickerKey, SelectedMention, TextFormat } from '../text-commands';
import {
  caretAfterCommand,
  dismissMentionCommand,
  formatOf,
  insertMentionCommand,
  linkCommand,
  markChangedBlocks,
  mentionAt,
  mentionQueryIn,
  relabelMentionCommand,
  removeMentionCommand,
  textPluginsOf,
  unlinkCommand,
} from '../text-commands';
import type { NewsMentionable } from '../types';

export interface CaretAnchor {
  getBoundingClientRect: () => DOMRect;
}

export interface ProseText {
  hostRef: (node: HTMLDivElement | null) => void;
  format: TextFormat;
  hasFocus: boolean;
  mentionQuery: MentionQuery | null;
  mentionAnchor: CaretAnchor | null;
  mentionChoices: readonly NewsMentionable[];
  activeChoiceId: string | null;
  chooseMention: (id: string) => void;
  selectedMention: SelectedMention | null;
  mentionElement: HTMLElement | null;
  linkRequestKey: number;
  run: (command: Command) => void;
  startMention: () => void;
  dismissMention: () => void;
  relabelMention: (label: string) => void;
  removeMention: () => void;
  closeMention: () => void;
  setLink: (href: string) => boolean;
  unlink: () => void;
  requestLink: () => void;
}

interface ProseTextOptions {
  text: string;
  isReadOnly: boolean;
  liveText: string | null;
  mentionables: readonly NewsMentionable[];
  pickerListId: string;
  onChange: (text: string) => void;
}

const EMPTY_FORMAT: TextFormat = { block: 'paragraph', bold: false, link: null };

const caretAnchorOf = (view: EditorView, pos: number): CaretAnchor => ({
  getBoundingClientRect: () => {
    const coords = view.coordsAtPos(pos);
    return new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top);
  },
});

interface LatestTextHandlers {
  onChange: (text: string) => void;
  onPickerKey: (key: PickerKey) => boolean;
}

const mappedPositionOf = (pos: number | null, mapping: Transaction['mapping']): number | null => {
  if (pos === null) {
    return null;
  }
  const mapped = mapping.mapResult(pos, 1);
  return mapped.deleted ? null : mapped.pos;
};

const elementAt = (view: EditorView, pos: number): HTMLElement | null => {
  const node = view.nodeDOM(pos);
  return node instanceof HTMLElement ? node : null;
};

export const useProseText = ({
  text,
  isReadOnly,
  liveText,
  mentionables,
  pickerListId,
  onChange,
}: ProseTextOptions): ProseText => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [hasFocus, setHasFocus] = useState(false);
  const [linkRequestKey, setLinkRequestKey] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const [trackedQuery, setTrackedQuery] = useState<string | null>(null);
  const emitted = useRef(text);
  const mentionQuery = editorState === null ? null : mentionQueryIn(editorState);
  const queryKey = mentionQuery === null ? null : `${mentionQuery.from}:${mentionQuery.query}`;
  const mentionChoices =
    mentionQuery === null ? [] : mentionChoicesOf(mentionables, mentionQuery.query);
  const activeChoice = mentionChoices[Math.min(activeIndex, mentionChoices.length - 1)] ?? null;

  if (trackedQuery !== queryKey) {
    setTrackedQuery(queryKey);
    setActiveIndex(0);
  }

  const insertChoice = (choice: NewsMentionable | null): void => {
    if (view === null || mentionQuery === null || choice === null) {
      return;
    }
    insertMentionCommand(mentionQuery, choice)(view.state, view.dispatch, view);
    view.focus();
  };

  const pickerKey = (key: PickerKey): boolean => {
    if (key === 'choose') {
      if (activeChoice === null) {
        return false;
      }
      insertChoice(activeChoice);
      return true;
    }
    setActiveIndex((index) => steppedIndexOf(index, mentionChoices.length, key));
    return true;
  };

  const latest = useRef<LatestTextHandlers>({ onChange, onPickerKey: pickerKey });
  useEffect(() => {
    latest.current = { onChange, onPickerKey: pickerKey };
  });

  useEffect(() => {
    if (host === null) {
      return;
    }
    const created: EditorView = new EditorView(host, {
      state: EditorState.create({
        doc: newsDocOf(emitted.current),
        plugins: textPluginsOf({
          onLinkRequest: () => {
            setLinkRequestKey((key) => key + 1);
          },
          onPickerKey: (key) => latest.current.onPickerKey(key),
          onMentionClick: setEditingPos,
        }),
      }),
      attributes: {
        'data-news-text': '',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': TEXT_FIELD_LABEL,
        id: 'news-field-text',
      },
      dispatchTransaction: (transaction) => {
        created.updateState(created.state.apply(transaction));
        if (transaction.docChanged) {
          const next = newsTextOf(created.state.doc);
          emitted.current = next;
          setEditingPos((pos) => mappedPositionOf(pos, transaction.mapping));
          latest.current.onChange(next);
        }
        setEditorState(created.state);
      },
      handleDOMEvents: {
        focus: () => {
          setHasFocus(true);
          return false;
        },
        blur: () => {
          setHasFocus(false);
          return false;
        },
      },
    });
    setView(created);
    setEditorState(created.state);
    return () => {
      created.destroy();
      setView(null);
      setEditorState(null);
    };
  }, [host]);

  useEffect(() => {
    if (view === null || text === emitted.current) {
      return;
    }
    emitted.current = text;
    view.updateState(EditorState.create({ doc: newsDocOf(text), plugins: view.state.plugins }));
    setEditorState(view.state);
  }, [view, text]);

  useEffect(() => {
    view?.setProps({ editable: () => !isReadOnly });
  }, [view, isReadOnly]);

  useEffect(() => {
    if (view !== null && !view.isDestroyed) {
      markChangedBlocks(view, {
        liveBlocks: liveText === null ? null : new Set(textBlocksOf(liveText)),
        label: CHANGED_MARK,
      });
    }
  }, [view, liveText]);

  const run = (command: Command): void => {
    if (view === null) {
      return;
    }
    command(view.state, view.dispatch, view);
    view.focus();
  };

  const isPickerOpen = mentionQuery !== null;
  const activeDescendant =
    activeChoice === null ? '' : kkMentionOptionId(pickerListId, activeChoice.id);
  useEffect(() => {
    view?.setProps({
      attributes: {
        'data-news-text': '',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': TEXT_FIELD_LABEL,
        id: 'news-field-text',
        'aria-autocomplete': 'list',
        'aria-expanded': String(isPickerOpen),
        'aria-controls': pickerListId,
        'aria-activedescendant': activeDescendant,
      },
    });
  }, [view, isPickerOpen, pickerListId, activeDescendant]);

  const selectedMention = editorState === null ? null : mentionAt(editorState, editingPos);

  return {
    hostRef: setHost,
    format: editorState === null ? EMPTY_FORMAT : formatOf(editorState),
    hasFocus,
    mentionQuery,
    mentionAnchor:
      view === null || mentionQuery === null ? null : caretAnchorOf(view, mentionQuery.from),
    mentionChoices,
    activeChoiceId: activeChoice?.id ?? null,
    chooseMention: (id) => {
      insertChoice(mentionChoices.find((choice) => choice.id === id) ?? null);
    },
    selectedMention,
    mentionElement:
      view === null || selectedMention === null ? null : elementAt(view, selectedMention.pos),
    linkRequestKey,
    run,
    startMention: () => {
      if (view === null) {
        return;
      }
      const { from } = view.state.selection;
      const before = view.state.doc.textBetween(Math.max(0, from - 1), from);
      const prefix = before.length === 0 || before === ' ' ? '@' : ' @';
      view.dispatch(view.state.tr.insertText(prefix).scrollIntoView());
      view.focus();
    },
    dismissMention: () => {
      run(dismissMentionCommand);
    },
    relabelMention: (label) => {
      if (view !== null && selectedMention !== null) {
        relabelMentionCommand(selectedMention.pos, label)(view.state, view.dispatch, view);
      }
    },
    removeMention: () => {
      if (selectedMention !== null) {
        setEditingPos(null);
        run(removeMentionCommand(selectedMention.pos));
      }
    },
    closeMention: () => {
      setEditingPos(null);
      if (selectedMention !== null) {
        run(caretAfterCommand(selectedMention.pos));
      }
    },
    setLink: (href) => {
      if (view === null) {
        return false;
      }
      const applied = linkCommand(href)(view.state, view.dispatch, view);
      view.focus();
      return applied;
    },
    unlink: () => {
      run(unlinkCommand);
    },
    requestLink: () => {
      setLinkRequestKey((key) => key + 1);
    },
  };
};
