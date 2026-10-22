import { KkPanel } from '@furria/ui/KkPanel';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AREA_HANDOVERS, NEWS_ORIGIN } from '@/features/session/app-sections';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
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
