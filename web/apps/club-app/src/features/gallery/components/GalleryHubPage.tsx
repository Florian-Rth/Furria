import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, GALLERY_TITLE, MORE_SECTION } from '@/features/session';
import { useGalleryHub } from '../hooks/use-gallery-hub';
import { GALLERY_LEAD } from '../hub-copy';
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
      header={<KkTitleHeader title={GALLERY_TITLE} lead={GALLERY_LEAD} />}
      handover={AREA_HANDOVERS.gallery}
    >
      <GalleryHubBody state={state} />
    </KkScreen>
  );
};
