import type { ChoreographyVersionsState } from '@/features/act-studio/hooks/use-choreography-versions';
import { useChoreographyVersions } from '@/features/act-studio/hooks/use-choreography-versions';
import {
  EVENING_VERSIONS_TITLE,
  VERSIONS_OLDER,
  VERSIONS_OLDER_RETRY,
  VERSIONS_TITLE,
} from '@/features/act-studio/undo-copy';
import type { ActStudio } from '@/features/acts/schemas';
import { EJ_VERSION_RESTORE, EJ_VERSION_SURE } from '../edit-jobs-copy';
import { useEjConfirm } from './use-ej-confirm';

export interface EjVersionRow {
  key: string;
  label: string;
  meta: string;
  current: boolean;
  restoreText: string;
  restoreLabel: string;
  armed: boolean;
  restore: () => void;
}

export interface EjVersions {
  title: string;
  state: ChoreographyVersionsState;
  rows: EjVersionRow[];
  restoring: boolean;
  olderText: string | null;
  loadingOlder: boolean;
  loadOlder: () => void;
}

export const useEjVersions = (
  actId: number,
  eventId: number | null,
  studio: ActStudio,
): EjVersions => {
  const versions = useChoreographyVersions(actId, eventId, studio);
  const confirm = useEjConfirm();

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
    olderText: versions.hasOlder
      ? versions.olderFailed
        ? VERSIONS_OLDER_RETRY
        : VERSIONS_OLDER
      : null,
    loadingOlder: versions.loadingOlder,
    loadOlder: versions.loadOlder,
  };
};
