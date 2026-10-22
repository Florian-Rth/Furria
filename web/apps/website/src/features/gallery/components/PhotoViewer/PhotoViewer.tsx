import { KkImageViewer } from '@furria/ui/KkImageViewer';
import type { FC } from 'react';
import type { AlbumPhotoEntry } from '@/features/gallery/gallery-content';
import { photoViewerLabels } from '@/features/gallery/gallery-content';
import { toViewerItem } from '@/features/gallery/photo-viewer-items';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';
import { PhotoViewerMeta } from './internal/ui/PhotoViewerMeta';

interface PhotoViewerProps {
  album: AlbumDetail;
  entries: AlbumPhotoEntry[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export const PhotoViewer: FC<PhotoViewerProps> = ({
  album,
  entries,
  index,
  onIndexChange,
  onClose,
}) => {
  const items = entries.map(toViewerItem);
  const meta = <PhotoViewerMeta album={album} />;

  return (
    <KkImageViewer
      items={items}
      index={index}
      labels={photoViewerLabels}
      title={album.title}
      footer={meta}
      onIndexChange={onIndexChange}
      onClose={onClose}
    />
  );
};
