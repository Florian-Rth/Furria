import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, GALLERY_TITLE, MORE_SECTION } from '@/features/session';
import { useGalleryHub } from '../hooks/use-gallery-hub';
import { GalleryHubBody } from './GalleryHubBody';

export const GalleryHubPage: FC = () => {
  const state = useGalleryHub();

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={GALLERY_TITLE}
      actions={state.actions}
      thread={state.thread}
      handover={AREA_HANDOVERS.gallery}
    >
      <GalleryHubBody state={state} />
    </KkScreen>
  );
};
