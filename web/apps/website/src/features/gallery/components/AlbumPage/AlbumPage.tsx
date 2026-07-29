import { KkSection, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { NextAlbum } from '@/features/gallery/components/NextAlbum/NextAlbum';
import { PhotoGrid } from '@/features/gallery/components/PhotoGrid/PhotoGrid';
import { PhotoViewer } from '@/features/gallery/components/PhotoViewer/PhotoViewer';
import type { Album } from '@/features/gallery/gallery-content';
import { buildPhotoPlaceholderLabel } from '@/features/gallery/gallery-content';
import { AlbumCreditRow } from './internal/layout/AlbumCreditRow';
import { AlbumHeader } from './internal/layout/AlbumHeader';
import { AlbumTitleGroup } from './internal/layout/AlbumTitleGroup';
import { AlbumTitleRow } from './internal/layout/AlbumTitleRow';
import { usePhotoViewer } from './internal/logic/use-photo-viewer';
import { AlbumBackLink } from './internal/ui/AlbumBackLink';
import { AlbumCredit } from './internal/ui/AlbumCredit';
import { AlbumHeadline } from './internal/ui/AlbumHeadline';
import { AlbumIntro } from './internal/ui/AlbumIntro';
import { AlbumMeta } from './internal/ui/AlbumMeta';
import { AlbumPhotoCount } from './internal/ui/AlbumPhotoCount';
import { AlbumViewerHint } from './internal/ui/AlbumViewerHint';

interface AlbumPageProps {
  album: Album;
}

export const AlbumPage: FC<AlbumPageProps> = ({ album }) => {
  const viewer = usePhotoViewer(album.photos.length);

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
            <AlbumCreditRow>
              <AlbumCredit album={album} />
              <AlbumViewerHint />
            </AlbumCreditRow>
          </AlbumHeader>
          <PhotoGrid>
            {album.photos.map((photo, index) => {
              const placeholderLabel = buildPhotoPlaceholderLabel(album, index);

              return (
                <PhotoGrid.Cell key={placeholderLabel} orientation={photo.orientation}>
                  <PhotoGrid.Action photo={photo} onOpen={() => viewer.open(index)}>
                    <PhotoGrid.Tile photo={photo} placeholderLabel={placeholderLabel} />
                  </PhotoGrid.Action>
                </PhotoGrid.Cell>
              );
            })}
          </PhotoGrid>
        </KkSection>
        <NextAlbum currentSlug={album.slug} />
        <PhotoViewer
          album={album}
          index={viewer.index}
          onStep={viewer.step}
          onClose={viewer.close}
        />
      </PageLayout.Body>
    </PageLayout>
  );
};
