import { KkPanel, KkScreen, KkScreenHeaderSkeleton, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion, AREA_HANDOVERS, NEWS_ORIGIN } from '@/features/session';
import { EDITOR_LOADING, NEW_POST_TITLE } from '../../editor-copy';

const SKELETON_LINES = 10;
const header = <KkScreenHeaderSkeleton />;

export const NewsEditorSkeleton: FC = () => (
  <KkScreen
    kind="working"
    title={NEW_POST_TITLE}
    origin={NEWS_ORIGIN}
    header={header}
    handover={AREA_HANDOVERS.news}
  >
    <AppSkeletonRegion label={EDITOR_LOADING}>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </KkPanel>
    </AppSkeletonRegion>
  </KkScreen>
);
