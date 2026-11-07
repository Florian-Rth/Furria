import type { SaveStatus } from '@furria/studio/autosave';
import type { EditorNote } from '@furria/studio/studio-editor';

export const SAVE_STATUS_TEXT: Record<SaveStatus, string> = {
  saved: 'Gespeichert',
  saving: 'Speichert…',
  failed: 'Nicht gespeichert – erneut versuchen',
};

export const SAVE_STATUS_SHORT: Record<SaveStatus, string> = {
  saved: 'Gespeichert',
  saving: 'Speichert…',
  failed: 'Erneut speichern',
};

export const EDITOR_NOTE_TEXT: Record<EditorNote['kind'], string> = {
  replayed: 'Jemand hat gleichzeitig geändert – deine Änderungen liegen jetzt darüber.',
  rejected:
    'Eine Änderung ließ sich nicht speichern. Das Studio zeigt wieder den gespeicherten Stand.',
  undoDropped: 'Ältere Schritte lassen sich nach der Änderung nicht mehr rückgängig machen.',
};

export const EDITOR_NOTE_GROUP = 'act-studio-document';
