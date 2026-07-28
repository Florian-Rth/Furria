import { KkSection, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { PhotoGrid } from '@/features/gallery/components/PhotoGrid/PhotoGrid';
import type { Album } from '@/features/gallery/gallery-content';
import { buildPhotoPlaceholderLabel } from '@/features/gallery/gallery-content';
import { AlbumCreditRow } from './internal/layout/AlbumCreditRow';
import { AlbumHeader } from './internal/layout/AlbumHeader';
import { AlbumTitleGroup } from './internal/layout/AlbumTitleGroup';
import { AlbumTitleRow } from './internal/layout/AlbumTitleRow';
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

export const AlbumPage: FC<AlbumPageProps> = ({ album }) => (
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
                <PhotoGrid.Tile photo={photo} placeholderLabel={placeholderLabel} />
              </PhotoGrid.Cell>
            );
          })}
        </PhotoGrid>
      </KkSection>
    </PageLayout.Body>
  </PageLayout>
);
