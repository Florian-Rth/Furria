import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { GALLERY_HELP_CHIPS } from '../gallery-help-chips';
import { GALLERY_HUB_HELP_COPY, GALLERY_HUB_HELP_SPOTS } from '../gallery-hub-help-copy';
import type { GalleryHelpViewer } from '../hooks/use-gallery-help-viewer';
import { GalleryHelpAlbumPreview } from './GalleryHelpAlbumPreview';

interface GalleryHubHelpProps {
  viewer: GalleryHelpViewer;
}

export const GalleryHubHelp: FC<GalleryHubHelpProps> = ({ viewer }) => {
  const seesPublication = viewer.manages || viewer.publishes;
  const publishedMark = seesPublication ? (
    <KkHelp.Text>{GALLERY_HUB_HELP_COPY.albums.published}</KkHelp.Text>
  ) : null;
  const selectionMark = viewer.publishes ? (
    <KkHelp.Text>{GALLERY_HUB_HELP_COPY.albums.selection}</KkHelp.Text>
  ) : null;

  const upload = viewer.sorts ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.uploads}>
        {GALLERY_HUB_HELP_COPY.upload.title}
      </KkHelp.Title>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.upload.text}</KkHelp.Text>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.upload.newAlbum}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  const inboxManage = viewer.manages ? (
    <KkHelp.Text>{GALLERY_HUB_HELP_COPY.inbox.manage}</KkHelp.Text>
  ) : null;
  const inbox = viewer.sorts ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.uploads}>
        {GALLERY_HUB_HELP_COPY.inbox.title}
      </KkHelp.Title>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.inbox.text}</KkHelp.Text>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.inbox.open}</KkHelp.Text>
      {inboxManage}
      <ScreenHelpShow spot={GALLERY_HUB_HELP_SPOTS.inbox} />
    </KkHelp.Hint>
  ) : null;

  const links = viewer.manages ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.manages}>
        {GALLERY_HUB_HELP_COPY.links.title}
      </KkHelp.Title>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.links.text}</KkHelp.Text>
      <ScreenHelpShow spot={GALLERY_HUB_HELP_SPOTS.links} />
    </KkHelp.Hint>
  ) : null;

  const bin = viewer.manages ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.manages}>
        {GALLERY_HUB_HELP_COPY.bin.title}
      </KkHelp.Title>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.bin.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  const website = viewer.publishes ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.publishes}>
        {GALLERY_HUB_HELP_COPY.website.title}
      </KkHelp.Title>
      <KkHelp.Text>{GALLERY_HUB_HELP_COPY.website.text}</KkHelp.Text>
      <ScreenHelpShow spot={GALLERY_HUB_HELP_SPOTS.website} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <GalleryHelpAlbumPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{GALLERY_HUB_HELP_COPY.albums.title}</KkHelp.Title>
        <KkHelp.Text>{GALLERY_HUB_HELP_COPY.albums.text}</KkHelp.Text>
        <KkHelp.Text>{GALLERY_HUB_HELP_COPY.albums.fresh}</KkHelp.Text>
        {publishedMark}
        {selectionMark}
        <ScreenHelpShow spot={GALLERY_HUB_HELP_SPOTS.albums} />
      </KkHelp.Hint>
      {upload}
      {inbox}
      {links}
      {bin}
      {website}
    </ScreenHelp>
  );
};
