import type { MentionKind } from '@furria/ui/rich-text';
import type { EditorState } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state';

const NO_KINDS: readonly MentionKind[] = [];

const hostKey = new PluginKey<readonly MentionKind[]>('rich-text-host');

export const hostPluginOf = (kinds: readonly MentionKind[]): Plugin<readonly MentionKind[]> =>
  new Plugin({ key: hostKey, state: { init: () => kinds, apply: (_, current) => current } });

export const mentionKindsIn = (state: EditorState): readonly MentionKind[] =>
  hostKey.getState(state) ?? NO_KINDS;
