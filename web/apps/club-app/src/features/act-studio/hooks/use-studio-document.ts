import type { StudioChange } from '@furria/studio/studio-changes';
import type { StudioEditor } from '@furria/studio/studio-editor';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { holdStudioEditor, openStudioEditor, releaseStudioEditor } from '../studio-editor-store';

export interface StudioDocumentEdit {
  studio: Studio;
  change: (change: StudioChange) => void;
  startGesture: () => void;
  endGesture: () => void;
  mark: (atSeconds: number, lengthSeconds: number) => void;
  addPart: (firstStepId: number, name: string) => void;
}

const editsOf = (editor: StudioEditor<Studio>, studio: Studio): StudioDocumentEdit => ({
  studio,
  change: editor.change,
  startGesture: editor.startGesture,
  endGesture: editor.endGesture,
  mark: (atSeconds, lengthSeconds) => {
    editor.change({
      kind: 'stepMark',
      stepId: editor.newLocalId(),
      openingStepId: editor.newLocalId(),
      atSeconds,
      lengthSeconds,
    });
  },
  addPart: (firstStepId, name) => {
    editor.change({ kind: 'partAdd', partId: editor.newLocalId(), firstStepId, name });
  },
});

export const useStudioDocument = (actId: number, source: Studio): StudioDocumentEdit => {
  const queryClient = useQueryClient();
  const editor = openStudioEditor(actId, source, queryClient);
  const snapshot = useSyncExternalStore(editor.subscribe, editor.snapshot);

  useEffect(() => {
    holdStudioEditor(actId);

    return () => {
      releaseStudioEditor(actId);
    };
  }, [actId]);

  useEffect(() => {
    void editor.adopt(source);
  }, [editor, source]);

  return editsOf(editor, snapshot.studio);
};
