import type { KkScreenOrigin } from '@furria/ui';
import { KkPanel, KkPanelStack, KkScreen, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 8;

interface AlbumScreenSkeletonProps {
  title: string;
  origin: KkScreenOrigin;
}

export const AlbumScreenSkeleton: FC<AlbumScreenSkeletonProps> = ({ title, origin }) => (
  <KkScreen kind="fullscreen" title={title} origin={origin}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
