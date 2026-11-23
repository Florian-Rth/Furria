import type { KkHonours, KkStanding } from '@furria/ui/honour-types';
import { toImageSource, toViewImageSource } from '@furria/ui/image-source';
import type { KkAvatarSize } from '@furria/ui/KkAvatar';
import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkPortraitViewer } from '@furria/ui/KkPortraitViewer';
import type { FC } from 'react';
import type { Picture } from '@/lib/api/schemas';
import { usePortraitView } from '../hooks/use-portrait-view';
import { PORTRAIT_VIEWER_LABELS, toPortraitOpenLabel } from '../portrait-view-labels';

const VIEW_SIZES = '100vw';

interface PortraitAvatarProps {
  name: string;
  initials: string;
  picture: Picture | null;
  size: KkAvatarSize;
  honours?: KkHonours;
  standing?: KkStanding;
  arrival?: boolean;
}

export const PortraitAvatar: FC<PortraitAvatarProps> = ({
  name,
  initials,
  picture,
  size,
  honours,
  standing,
  arrival,
}) => {
  const view = usePortraitView(toPortraitOpenLabel(name));
  const image = toImageSource(picture, 'portrait');
  const viewer =
    picture === null ? null : (
      <KkPortraitViewer
        name={name}
        image={toViewImageSource(picture, 'portrait', VIEW_SIZES)}
        open={view.shown}
        labels={PORTRAIT_VIEWER_LABELS}
        onClose={view.close}
      />
    );

  return (
    <>
      <KkAvatar
        initials={initials}
        image={image}
        size={size}
        honours={honours}
        standing={standing}
        arrival={arrival}
        open={view.open}
      />
      {viewer}
    </>
  );
};
