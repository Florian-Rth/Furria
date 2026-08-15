import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { SectionActionLink } from '@/components/SectionActionLink';
import type { Album } from '@/features/gallery/gallery-content';
import {
  albumLinkLabel,
  albumPreviewHeading,
  albumPreviewKicker,
  buildAlbumHref,
  buildAlbumPreviewEntries,
} from '@/features/gallery/gallery-content';
import { AlbumPreviewGrid } from './internal/layout/AlbumPreviewGrid';
import { AlbumPreviewCell } from './internal/ui/AlbumPreviewCell';

interface AlbumPreviewProps {
  album: Album;
}

export const AlbumPreview: FC<AlbumPreviewProps> = ({ album }) => {
  const entries = buildAlbumPreviewEntries(album);
  const albumAction = (
    <SectionActionLink to={buildAlbumHref(album.slug)}>{albumLinkLabel}</SectionActionLink>
  );

  return (
    <KkSection>
      <KkSection.Header
        kicker={albumPreviewKicker}
        title={albumPreviewHeading}
        action={albumAction}
      />
      <AlbumPreviewGrid>
        {entries.map((entry) => (
          <AlbumPreviewCell key={entry.placeholderLabel} entry={entry} />
        ))}
      </AlbumPreviewGrid>
    </KkSection>
  );
};
