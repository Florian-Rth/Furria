import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import type { Node as ProseNode } from 'prosemirror-model';
import { Schema } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { TEASER_CUT_WORDS, TEASER_FIELD_LABEL } from '../editor-copy';
import type { TextMeasure } from '../teaser-cuts';
import { greyFromOf, TEASER_SURFACES, teaserCutsOf } from '../teaser-cuts';

const PARAGRAPH_START = 1;
const TEASER_WHITESPACE = /\s+/g;

export interface NewsTeaserEditorOptions {
  teaser: string;
  measureOf: () => TextMeasure;
  onChange: (teaser: string) => void;
}

export interface NewsTeaserEditor {
  showTeaser: (teaser: string) => void;
  setReadOnly: (isReadOnly: boolean) => void;
  destroy: () => void;
}

const teaserSchema = new Schema({
  nodes: {
    doc: { content: 'paragraph' },
    paragraph: { content: 'text*', toDOM: () => ['p', 0] },
    text: {},
  },
});

const teaserDocOf = (teaser: string): ProseNode =>
  teaserSchema.nodes.doc.create(
    null,
    teaserSchema.nodes.paragraph.create(
      null,
      teaser.length === 0 ? [] : [teaserSchema.text(teaser)],
    ),
  );

const teaserOf = (doc: ProseNode): string => doc.textContent.replace(TEASER_WHITESPACE, ' ');

const cutWidgetOf = (word: string): HTMLElement => {
  const tick = document.createElement('span');
  tick.dataset.kkCut = word;
  tick.setAttribute('aria-hidden', 'true');
  return tick;
};

const cutPluginOf = (measureOf: () => TextMeasure): Plugin =>
  new Plugin({
    props: {
      decorations: (state) => {
        const text = state.doc.textContent;
        const cuts = teaserCutsOf(text, TEASER_SURFACES, measureOf());
        const greyFrom = greyFromOf(cuts, TEASER_SURFACES.length);
        const ticks = cuts.map((cut) =>
          Decoration.widget(PARAGRAPH_START + cut.index, () =>
            cutWidgetOf(TEASER_CUT_WORDS[cut.surface]),
          ),
        );
        const rest =
          greyFrom === null
            ? []
            : [
                Decoration.inline(PARAGRAPH_START + greyFrom, PARAGRAPH_START + text.length, {
                  'data-kk-cut-rest': '',
                }),
              ];
        return DecorationSet.create(state.doc, [...ticks, ...rest]);
      },
    },
  });

export const createNewsTeaserEditor = (
  host: HTMLElement,
  { teaser, measureOf, onChange }: NewsTeaserEditorOptions,
): NewsTeaserEditor => {
  let emitted = teaser;
  const stateOf = (text: string): EditorState =>
    EditorState.create({
      doc: teaserDocOf(text),
      plugins: [
        history(),
        keymap({ 'Mod-z': undo, 'Shift-Mod-z': redo, Enter: () => true }),
        cutPluginOf(measureOf),
      ],
    });
  const view: EditorView = new EditorView(host, {
    state: stateOf(teaser),
    attributes: {
      'data-news-teaser': '',
      role: 'textbox',
      'aria-multiline': 'false',
      'aria-label': TEASER_FIELD_LABEL,
      id: 'news-field-teaser',
    },
    dispatchTransaction: (transaction) => {
      view.updateState(view.state.apply(transaction));
      if (transaction.docChanged) {
        emitted = teaserOf(view.state.doc);
        onChange(emitted);
      }
    },
  });
  void document.fonts.ready.then(() => {
    if (!view.isDestroyed) {
      view.dispatch(view.state.tr.setMeta('addToHistory', false));
    }
  });

  return {
    showTeaser: (next) => {
      if (next === emitted) {
        return;
      }
      emitted = next;
      view.updateState(stateOf(next));
    },
    setReadOnly: (isReadOnly) => {
      view.setProps({ editable: () => !isReadOnly });
    },
    destroy: () => {
      view.destroy();
    },
  };
};
