import type { ActStudio } from '@/features/acts/schemas';
import { useChoreographyRestore, useChoreographyVersionsQuery } from '../history-api';
import { restoreLabelOf, versionLabelOf, versionMetaOf } from '../undo-copy';

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
  hasOlder: boolean;
  loadingOlder: boolean;
  olderFailed: boolean;
  loadOlder: () => void;
}

export const useChoreographyVersions = (
  actId: number,
  studio: ActStudio,
): ChoreographyVersionsView => {
  const current = studio.choreography?.version ?? null;
  const query = useChoreographyVersionsQuery(actId, current !== null);
  const restore = useChoreographyRestore(actId);
  const stateOf = (): ChoreographyVersionsState => {
    if (query.error !== null && query.data === undefined) {
      return 'failed';
    }

    return query.data === undefined && current !== null ? 'loading' : 'ready';
  };

  const pages = query.data?.pages ?? [];

  return {
    state: stateOf(),
    rows: pages
      .flatMap((page) => page.versions)
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
    restoring: restore.isPending,
    hasOlder: query.hasNextPage,
    loadingOlder: query.isFetchingNextPage,
    olderFailed: query.isFetchNextPageError,
    loadOlder: () => {
      void query.fetchNextPage();
    },
  };
};
