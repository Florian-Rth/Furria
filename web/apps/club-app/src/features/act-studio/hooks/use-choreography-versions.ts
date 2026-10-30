import type { Studio } from '@/features/acts/schemas';
import { useChoreographyRestore, useChoreographyVersionsQuery } from '../history-api';
import { restoreLabelOf, versionLabelOf, versionMetaOf } from '../undo-copy';
import { useStudioHistory } from './use-studio-history';

export interface VersionRowView {
  key: string;
  label: string;
  restoreLabel: string;
  meta: string;
  current: boolean;
  restore: () => void;
}

export type ChoreographyVersionsState = 'loading' | 'failed' | 'ready';

export interface ChoreographyVersionsView {
  state: ChoreographyVersionsState;
  rows: VersionRowView[];
  restoring: boolean;
}

const currentVersionOf = (studio: Studio, eventId: number | null): number | null =>
  eventId === null
    ? (studio.choreography?.version ?? null)
    : (studio.evenings.find((evening) => evening.eventId === eventId)?.appearance?.choreography
        ?.version ?? null);

export const useChoreographyVersions = (
  actId: number,
  eventId: number | null,
  studio: Studio,
): ChoreographyVersionsView => {
  const current = currentVersionOf(studio, eventId);
  const query = useChoreographyVersionsQuery(actId, eventId, current !== null);
  const restore = useChoreographyRestore(actId, eventId);
  const { history } = useStudioHistory(actId);
  const stateOf = (): ChoreographyVersionsState => {
    if (query.error !== null) {
      return 'failed';
    }

    return query.data === undefined && current !== null ? 'loading' : 'ready';
  };

  return {
    state: stateOf(),
    rows: [...(query.data?.versions ?? [])]
      .sort((left, right) => right.version - left.version)
      .map((version) => ({
        key: String(version.version),
        label: versionLabelOf(version),
        restoreLabel: restoreLabelOf(version),
        meta: versionMetaOf(version),
        current: version.version === current,
        restore: () => {
          restore.mutate(version.version);
        },
      })),
    restoring: restore.isPending || history.busy,
  };
};
