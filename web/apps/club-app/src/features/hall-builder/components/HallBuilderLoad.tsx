import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isNotFoundError } from '@/lib/query-error';
import { HALL_BUILDER_TITLE, HALL_LOAD_FAILED, HALL_RETRY_LABEL } from '../hall-builder-copy';
import type { HallBuilderPage } from '../hooks/use-hall-builder-page';
import { HallBuilderScreen } from './HallBuilderScreen';

const SKELETON_LINES = 10;

interface HallBuilderLoadProps {
  page: HallBuilderPage;
}

export const HallBuilderLoad: FC<HallBuilderLoadProps> = ({ page }) => {
  const { query, origin } = page;

  if (isNotFoundError(query.error)) {
    return <ScreenNotFound />;
  }
  if (query.data !== undefined) {
    return (
      <HallBuilderScreen
        key={page.sessionKey}
        hall={query.data}
        origin={origin}
        onConflict={page.reloadAfterConflict}
      />
    );
  }

  const retry = (
    <KkButton variant="outlined" onClick={page.retry}>
      {HALL_RETRY_LABEL}
    </KkButton>
  );
  const body =
    query.error === null ? (
      <KkSkeletonBlock lines={SKELETON_LINES} />
    ) : (
      <KkErrorState title={HALL_BUILDER_TITLE} description={HALL_LOAD_FAILED} action={retry} />
    );

  return (
    <KkScreen kind="fullscreen" title={HALL_BUILDER_TITLE} origin={origin}>
      {body}
    </KkScreen>
  );
};
