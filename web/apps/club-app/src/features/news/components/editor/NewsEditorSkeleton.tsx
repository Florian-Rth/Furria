import { KkPanel, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion, NEWS_ORIGIN } from '@/features/session';
import { EDITOR_LOADING, NEW_POST_TITLE } from '../../editor-copy';

const SKELETON_LINES = 10;

export const NewsEditorSkeleton: FC = () => (
  <KkScreen kind="working" title={NEW_POST_TITLE} origin={NEWS_ORIGIN}>
    <AppSkeletonRegion label={EDITOR_LOADING}>
      <KkPanel variant="block">
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </KkPanel>
    </AppSkeletonRegion>
  </KkScreen>
);
