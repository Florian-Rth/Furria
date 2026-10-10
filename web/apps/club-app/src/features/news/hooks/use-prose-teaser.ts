import { useKkTextMeasure } from '@furria/ui';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { useEffect, useRef, useState } from 'react';
import { teaserDocOf, teaserOf } from '@/lib/news-prose';
import { TEASER_CUT_WORDS, TEASER_FIELD_LABEL } from '../editor-copy';
import type { TextMeasure } from '../teaser-cuts';
import { greyFromOf, TEASER_SURFACES, teaserCutsOf } from '../teaser-cuts';

const PARAGRAPH_START = 1;

export interface ProseTeaser {
  hostRef: (node: HTMLDivElement | null) => void;
}

interface ProseTeaserOptions {
  teaser: string;
  isReadOnly: boolean;
  onChange: (teaser: string) => void;
}

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

export const useProseTeaser = ({
  teaser,
  isReadOnly,
  onChange,
}: ProseTeaserOptions): ProseTeaser => {
  const measure = useKkTextMeasure();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const emitted = useRef(teaser);

  const latest = useRef({ onChange, measure });

  useEffect(() => {
    latest.current = { onChange, measure };
  });

  useEffect(() => {
    if (host === null) {
      return;
    }
    const created: EditorView = new EditorView(host, {
      state: EditorState.create({
        doc: teaserDocOf(emitted.current),
        plugins: [
          history(),
          keymap({ 'Mod-z': undo, 'Shift-Mod-z': redo, Enter: () => true }),
          cutPluginOf(() => latest.current.measure),
        ],
      }),
      attributes: {
        'data-news-teaser': '',
        role: 'textbox',
        'aria-multiline': 'false',
        'aria-label': TEASER_FIELD_LABEL,
        id: 'news-field-teaser',
      },
      dispatchTransaction: (transaction) => {
        created.updateState(created.state.apply(transaction));
        if (transaction.docChanged) {
          const next = teaserOf(created.state.doc);
          emitted.current = next;
          latest.current.onChange(next);
        }
      },
    });
    setView(created);
    return () => {
      created.destroy();
      setView(null);
    };
  }, [host]);

  useEffect(() => {
    if (view === null || teaser === emitted.current) {
      return;
    }
    emitted.current = teaser;
    view.updateState(EditorState.create({ doc: teaserDocOf(teaser), plugins: view.state.plugins }));
  }, [view, teaser]);

  useEffect(() => {
    view?.setProps({ editable: () => !isReadOnly });
  }, [view, isReadOnly]);

  useEffect(() => {
    if (view === null) {
      return;
    }
    const remeasure = (): void => {
      if (!view.isDestroyed) {
        view.dispatch(view.state.tr.setMeta('addToHistory', false));
      }
    };
    void document.fonts.ready.then(remeasure);
  }, [view]);

  return { hostRef: setHost };
};
