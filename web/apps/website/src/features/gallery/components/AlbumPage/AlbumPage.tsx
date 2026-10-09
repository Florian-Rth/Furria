import { KkSection, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { NextAlbum } from '@/features/gallery/components/NextAlbum/NextAlbum';
import { PhotoGrid } from '@/features/gallery/components/PhotoGrid/PhotoGrid';
import { PhotoViewer } from '@/features/gallery/components/PhotoViewer/PhotoViewer';
import { buildAlbumPhotoEntries } from '@/features/gallery/gallery-content';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';
import { AlbumHeader } from './internal/layout/AlbumHeader';
import { AlbumHintRow } from './internal/layout/AlbumHintRow';
import { AlbumTitleGroup } from './internal/layout/AlbumTitleGroup';
import { AlbumTitleRow } from './internal/layout/AlbumTitleRow';
import { usePhotoViewer } from './internal/logic/use-photo-viewer';
import { AlbumBackLink } from './internal/ui/AlbumBackLink';
import { AlbumHeadline } from './internal/ui/AlbumHeadline';
import { AlbumIntro } from './internal/ui/AlbumIntro';
import { AlbumMeta } from './internal/ui/AlbumMeta';
import { AlbumPhotoCell } from './internal/ui/AlbumPhotoCell';
import { AlbumPhotoCount } from './internal/ui/AlbumPhotoCount';
import { AlbumViewerHint } from './internal/ui/AlbumViewerHint';

interface AlbumPageProps {
  album: AlbumDetail;
}

export const AlbumPage: FC<AlbumPageProps> = ({ album }) => {
  const viewer = usePhotoViewer(album.photos.length);
  const photoEntries = buildAlbumPhotoEntries(album);

  return (
    <PageLayout>
      <PageLayout.Body>
        <KkSection>
          <AlbumHeader>
            <AlbumBackLink />
            <AlbumTitleRow>
              <AlbumTitleGroup>
                <AlbumMeta album={album} />
                <AlbumHeadline album={album} />
              </AlbumTitleGroup>
              <AlbumPhotoCount album={album} />
            </AlbumTitleRow>
            <AlbumIntro album={album} />
            <AlbumHintRow>
              <AlbumViewerHint />
            </AlbumHintRow>
          </AlbumHeader>
          <PhotoGrid>
            {photoEntries.map((entry) => (
              <AlbumPhotoCell key={entry.photo.mediaItemId} entry={entry} onOpen={viewer.open} />
            ))}
          </PhotoGrid>
        </KkSection>
        <NextAlbum currentAlbumId={album.albumId} />
        <PhotoViewer
          album={album}
          entries={photoEntries}
          index={viewer.index}
          onStep={viewer.step}
          onClose={viewer.close}
        />
      </PageLayout.Body>
    </PageLayout>
  );
};
