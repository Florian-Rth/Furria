import { kkMentionOptionId } from '@furria/ui/KkMentionPicker';
import type { MentionKind } from '@furria/ui/rich-text';
import { EditorView } from 'prosemirror-view';
import type { RichTextCommand } from './rich-text-commands';
import { commandOf } from './rich-text-commands';
import { editedMentionIn, mentionPickerIn } from './rich-text-mentions';
import type { RichTextSettings, RichTextState } from './rich-text-state';
import { openRichText, reopenRichText, richTextOf, settingsTransactionOf } from './rich-text-state';

export interface CaretAnchor {
  getBoundingClientRect: () => DOMRect;
}

export interface RichTextFieldIdentity {
  fieldId: string;
  label: string;
  pickerListId: string;
}

export interface RichTextEditorOptions extends RichTextFieldIdentity {
  text: string;
  mentionKinds: readonly MentionKind[];
  onChange: (text: string) => void;
  onState: (state: RichTextState) => void;
}

export interface RichTextEditor {
  run: (command: RichTextCommand) => boolean;
  settle: (settings: RichTextSettings) => void;
  showText: (text: string) => void;
  setReadOnly: (isReadOnly: boolean) => void;
  pickerAnchorOf: (state: RichTextState) => CaretAnchor | null;
  editedMentionElementOf: (state: RichTextState) => HTMLElement | null;
  destroy: () => void;
}

const FOCUS_KEEPING_COMMANDS: ReadonlySet<RichTextCommand['kind']> = new Set([
  'relabel-mention',
  'request-link',
]);

const attributesOf = (
  state: RichTextState,
  { fieldId, label, pickerListId }: RichTextFieldIdentity,
): Record<string, string> => {
  const picker = mentionPickerIn(state);
  const activeId = picker?.active?.id ?? null;
  return {
    'data-rich-text': '',
    role: 'textbox',
    'aria-multiline': 'true',
    'aria-label': label,
    id: fieldId,
    'aria-autocomplete': 'list',
    'aria-expanded': String(picker !== null),
    'aria-controls': pickerListId,
    'aria-activedescendant': activeId === null ? '' : kkMentionOptionId(pickerListId, activeId),
  };
};

export const createRichTextEditor = (
  host: HTMLElement,
  { text, mentionKinds, onChange, onState, ...identity }: RichTextEditorOptions,
): RichTextEditor => {
  let emitted = text;
  const view: EditorView = new EditorView(host, {
    state: openRichText(text, mentionKinds),
    attributes: (state) => attributesOf(state, identity),
    dispatchTransaction: (transaction) => {
      view.updateState(view.state.apply(transaction));
      if (transaction.docChanged) {
        emitted = richTextOf(view.state);
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
      view.updateState(reopenRichText(view.state, next));
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
