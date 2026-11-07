import { EJ_VERSION_RESTORE, EJ_VERSION_SURE } from '@furria/studio/edit-jobs-copy';
import { useJobConfirm } from '@furria/studio/use-job-confirm';
import type { ActStudio } from '@/features/acts/schemas';
import {
  EVENING_VERSIONS_TITLE,
  VERSIONS_OLDER,
  VERSIONS_OLDER_RETRY,
  VERSIONS_TITLE,
} from '../undo-copy';
import type { ChoreographyVersionsState } from './use-choreography-versions';
import { useChoreographyVersions } from './use-choreography-versions';

export interface EditorVersionRowView {
  key: string;
  label: string;
  meta: string;
  current: boolean;
  restoreText: string;
  restoreLabel: string;
  armed: boolean;
  restore: () => void;
}

export interface EditorVersions {
  title: string;
  state: ChoreographyVersionsState;
  rows: EditorVersionRowView[];
  restoring: boolean;
  olderText: string | null;
  loadingOlder: boolean;
  loadOlder: () => void;
}

export const olderTextOf = (hasOlder: boolean, failed: boolean): string | null => {
  if (!hasOlder) {
    return null;
  }

  return failed ? VERSIONS_OLDER_RETRY : VERSIONS_OLDER;
};

export const useEditorVersions = (
  actId: number,
  eventId: number | null,
  studio: ActStudio,
): EditorVersions => {
  const versions = useChoreographyVersions(actId, eventId, studio);
  const confirm = useJobConfirm();

  return {
    title: eventId === null ? VERSIONS_TITLE : EVENING_VERSIONS_TITLE,
    state: versions.state,
    rows: versions.rows.map((row) => {
      const armed = confirm.armed(row.key);

      return {
        key: row.key,
        label: row.label,
        meta: row.meta,
        current: row.current,
        restoreText: armed ? EJ_VERSION_SURE : EJ_VERSION_RESTORE,
        restoreLabel: armed ? EJ_VERSION_SURE : row.restoreLabel,
        armed,
        restore: () => {
          confirm.press(row.key, row.restore);
        },
      };
    }),
    restoring: versions.restoring,
    olderText: olderTextOf(versions.hasOlder, versions.olderFailed),
    loadingOlder: versions.loadingOlder,
    loadOlder: versions.loadOlder,
  };
};
