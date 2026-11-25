import { KkScreen } from '@furria/ui/KkScreen';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS, GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { useGalleryHelpViewer } from '../hooks/use-gallery-help-viewer';
import { useGalleryHub } from '../hooks/use-gallery-hub';
import { GalleryHubBody } from './GalleryHubBody';
import { GalleryHubHelp } from './GalleryHubHelp';

export const GalleryHubPage: FC = () => {
  const state = useGalleryHub();
  const helpViewer = useGalleryHelpViewer(state.sorts);
  const help = toScreenHelp(<GalleryHubHelp viewer={helpViewer} />);

  return (
    <KkScreen
      kind="overview"
      section={MORE_SECTION}
      title={GALLERY_TITLE}
      actions={state.actions}
      thread={state.thread}
      help={help}
      header={<KkTitleHeader title={GALLERY_TITLE} />}
      handover={AREA_HANDOVERS.gallery}
    >
      <GalleryHubBody state={state} />
    </KkScreen>
  );
};
