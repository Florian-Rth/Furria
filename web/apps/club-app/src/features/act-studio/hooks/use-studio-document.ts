import type { StudioDocumentEdit } from '@furria/studio/studio-document-edit';
import type { StudioEditor } from '@furria/studio/studio-editor';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import type { ActStudio } from '@/features/acts/schemas';
import type { StudioScope } from '../studio-editor-store';
import {
  adoptStudio,
  holdStudioEditor,
  openStudioEditor,
  releaseStudioEditor,
} from '../studio-editor-store';

const editsOf = (
  editor: StudioEditor<ActStudio>,
  studio: ActStudio,
): StudioDocumentEdit<ActStudio> => ({
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
  addSpot: () => {
    const spotId = editor.newLocalId();
    editor.change({ kind: 'spotAdd', spotId });

    return spotId;
  },
  direct: editor.direct,
});

export const useStudioDocument = (
  scope: StudioScope,
  source: ActStudio,
): StudioDocumentEdit<ActStudio> => {
  const queryClient = useQueryClient();
  const { actId, eventId } = scope;
  const editor = openStudioEditor({ actId, eventId }, source, queryClient);
  const snapshot = useSyncExternalStore(editor.subscribe, editor.snapshot);

  useEffect(() => {
    holdStudioEditor({ actId, eventId });

    return () => {
      releaseStudioEditor({ actId, eventId });
    };
  }, [actId, eventId]);

  useEffect(() => {
    adoptStudio({ actId, eventId }, source);
  }, [actId, eventId, source]);

  return editsOf(editor, snapshot.studio);
};
