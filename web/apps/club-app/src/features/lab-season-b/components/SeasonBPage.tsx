import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import { useSeasonBoard } from '../hooks/use-season-board';
import { LOAD_FAILED, NO_EVENINGS, SEASON_TITLE } from '../season-b-copy';
import { SeasonBoardView } from './SeasonBoardView';
import { SeasonTools } from './SeasonTools';

const SKELETON_LINES = 10;

export const SeasonBPage: FC = () => {
  const board = useSeasonBoard();
  const season = board.query.data;
  const loaded =
    board.columns.length === 0 ? (
      <KkEmptyState title={SEASON_TITLE} description={NO_EVENINGS} />
    ) : (
      <SeasonBoardView board={board} />
    );
  const retry = (): void => {
    void board.query.refetch();
  };
  const failed =
    board.query.isError && season === undefined ? (
      <KkRetryAlert message={LOAD_FAILED} retrying={board.query.isFetching} onRetry={retry} />
    ) : null;
  const body = season === undefined ? <KkSkeletonBlock lines={SKELETON_LINES} /> : loaded;
  const tools = <SeasonTools board={board} />;

  return (
    <KkScreen kind="working" title={SEASON_TITLE} origin={LAB_ORIGIN} tools={tools}>
      {failed ?? body}
    </KkScreen>
  );
};
