import { kkMentionOptionId } from '@furria/ui/KkMentionPicker';
import { EditorView } from 'prosemirror-view';
import { TEXT_FIELD_LABEL } from '../editor-copy';
import type { NewsTextCommand } from './news-text-commands';
import { commandOf } from './news-text-commands';
import { editedMentionIn, mentionPickerIn } from './news-text-mentions';
import type { NewsTextSettings, NewsTextState } from './news-text-state';
import { newsTextOf, openNewsText, reopenNewsText, settingsTransactionOf } from './news-text-state';

export interface CaretAnchor {
  getBoundingClientRect: () => DOMRect;
}

export interface NewsTextEditorOptions {
  text: string;
  pickerListId: string;
  onChange: (text: string) => void;
  onState: (state: NewsTextState) => void;
}

export interface NewsTextEditor {
  run: (command: NewsTextCommand) => boolean;
  settle: (settings: NewsTextSettings) => void;
  showText: (text: string) => void;
  setReadOnly: (isReadOnly: boolean) => void;
  pickerAnchorOf: (state: NewsTextState) => CaretAnchor | null;
  editedMentionElementOf: (state: NewsTextState) => HTMLElement | null;
  destroy: () => void;
}

const FOCUS_KEEPING_COMMANDS: ReadonlySet<NewsTextCommand['kind']> = new Set([
  'relabel-mention',
  'request-link',
]);

const attributesOf = (state: NewsTextState, pickerListId: string): Record<string, string> => {
  const picker = mentionPickerIn(state);
  const activeId = picker?.active?.id ?? null;
  return {
    'data-news-text': '',
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-label': TEXT_FIELD_LABEL,
    id: 'news-field-text',
    'aria-autocomplete': 'list',
    'aria-expanded': String(picker !== null),
    'aria-controls': pickerListId,
    'aria-activedescendant': activeId === null ? '' : kkMentionOptionId(pickerListId, activeId),
  };
};

export const createNewsTextEditor = (
  host: HTMLElement,
  { text, pickerListId, onChange, onState }: NewsTextEditorOptions,
): NewsTextEditor => {
  let emitted = text;
  const view: EditorView = new EditorView(host, {
    state: openNewsText(text),
    attributes: (state) => attributesOf(state, pickerListId),
    dispatchTransaction: (transaction) => {
      view.updateState(view.state.apply(transaction));
      if (transaction.docChanged) {
        emitted = newsTextOf(view.state);
        onChange(emitted);
      }
      onState(view.state);
    },
  });
  onState(view.state);

  return {
    run: (command) => {
      const applies = commandOf(command)(view.state, view.dispatch, view);
      if (!FOCUS_KEEPING_COMMANDS.has(command.kind)) {
        view.focus();
      }
      return applies;
    },
    settle: (settings) => {
      const transaction = settingsTransactionOf(view.state, settings);
      if (transaction !== null) {
        view.dispatch(transaction);
      }
    },
    showText: (next) => {
      if (next === emitted) {
        return;
      }
      emitted = next;
      view.updateState(reopenNewsText(view.state, next));
      onState(view.state);
    },
    setReadOnly: (isReadOnly) => {
      view.setProps({ editable: () => !isReadOnly });
    },
    pickerAnchorOf: (state) => {
      const picker = mentionPickerIn(state);
      if (picker === null) {
        return null;
      }
      return {
        getBoundingClientRect: () => {
          const coords = view.coordsAtPos(picker.from);
          return new DOMRect(coords.left, coords.top, 1, coords.bottom - coords.top);
        },
      };
    },
    editedMentionElementOf: (state) => {
      const edited = editedMentionIn(state);
      const node = edited === null ? null : view.nodeDOM(edited.pos);
      return node instanceof HTMLElement ? node : null;
    },
    destroy: () => {
      view.destroy();
    },
  };
};
