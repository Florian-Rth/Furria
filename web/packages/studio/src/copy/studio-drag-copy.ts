import type { defaultPreset } from '@dnd-kit/dom';
import { Accessibility } from '@dnd-kit/dom';

type DragId = string | number;
type DragPlugins = typeof defaultPreset.plugins;

export interface DragNames {
  itemOf: (id: DragId) => string;
  targetOf: (id: DragId) => string;
}

interface DragEnds {
  operation: { source: { id: DragId } | null; target: { id: DragId } | null };
  canceled?: boolean;
}

export const STUDIO_DRAG_HELP =
  'Zum Aufnehmen Leertaste drücken, mit den Pfeiltasten bewegen, mit Leertaste ablegen oder mit Escape abbrechen.';

export const dragPickedTextOf = (item: string): string => `${item} aufgenommen.`;
export const dragOverTextOf = (item: string, target: string | null): string =>
  target === null ? `${item} über keinem Ziel.` : `${item} über ${target}.`;
export const dragDroppedTextOf = (
  item: string,
  target: string | null,
  canceled: boolean,
): string =>
  canceled || target === null ? `${item} zurückgelegt.` : `${item} abgelegt: ${target}.`;

export const studioDragPluginsOf =
  ({ itemOf, targetOf }: DragNames) =>
  (defaults: DragPlugins): DragPlugins => {
    const targetName = (target: { id: DragId } | null): string | null =>
      target === null ? null : targetOf(target.id);

    return [
      ...defaults.filter((plugin) => plugin !== Accessibility),
      Accessibility.configure({
        screenReaderInstructions: { draggable: STUDIO_DRAG_HELP },
        announcements: {
          dragstart: ({ operation: { source } }: DragEnds): string | undefined =>
            source === null ? undefined : dragPickedTextOf(itemOf(source.id)),
          dragover: ({ operation: { source, target } }: DragEnds): string | undefined =>
            source === null || source.id === target?.id
              ? undefined
              : dragOverTextOf(itemOf(source.id), targetName(target)),
          dragend: ({ operation: { source, target }, canceled }: DragEnds): string | undefined =>
            source === null
              ? undefined
              : dragDroppedTextOf(itemOf(source.id), targetName(target), canceled === true),
        },
      }),
    ];
  };
