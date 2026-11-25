import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ALBUM_HELP_COPY, ALBUM_HELP_SPOTS } from '../album-help-copy';
import { GALLERY_HELP_CHIPS } from '../gallery-help-chips';
import type { AlbumRights } from '../hooks/use-album';
import { AlbumHelpSelectPreview } from './AlbumHelpSelectPreview';

interface AlbumHelpProps {
  rights: AlbumRights;
}

export const AlbumHelp: FC<AlbumHelpProps> = ({ rights }) => {
  const selects = rights.curates || rights.managesItems;

  const upload = rights.uploads ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.uploads}>{ALBUM_HELP_COPY.upload.title}</KkHelp.Title>
      <KkHelp.Text>{ALBUM_HELP_COPY.upload.text}</KkHelp.Text>
      <ScreenHelpShow spot={ALBUM_HELP_SPOTS.tools} />
    </KkHelp.Hint>
  ) : null;

  const curate = rights.curates ? <KkHelp.Text>{ALBUM_HELP_COPY.select.curate}</KkHelp.Text> : null;
  const manage = rights.managesItems ? (
    <KkHelp.Text>{ALBUM_HELP_COPY.select.manage}</KkHelp.Text>
  ) : null;
  const select = selects ? (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <AlbumHelpSelectPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{ALBUM_HELP_COPY.select.title}</KkHelp.Title>
      <KkHelp.Text>{ALBUM_HELP_COPY.select.text}</KkHelp.Text>
      <KkHelp.Text>{ALBUM_HELP_COPY.select.done}</KkHelp.Text>
      {curate}
      {manage}
    </KkHelp.Hint>
  ) : null;

  const shelf = rights.curates ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.publishes}>{ALBUM_HELP_COPY.shelf.title}</KkHelp.Title>
      <KkHelp.Text>{ALBUM_HELP_COPY.shelf.text}</KkHelp.Text>
      <KkHelp.Text>{ALBUM_HELP_COPY.shelf.edit}</KkHelp.Text>
      <ScreenHelpShow spot={ALBUM_HELP_SPOTS.shelf} />
    </KkHelp.Hint>
  ) : null;

  const edit = rights.managesItems ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={GALLERY_HELP_CHIPS.manages}>{ALBUM_HELP_COPY.edit.title}</KkHelp.Title>
      <KkHelp.Text>{ALBUM_HELP_COPY.edit.text}</KkHelp.Text>
      <ScreenHelpShow spot={ALBUM_HELP_SPOTS.tools} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{ALBUM_HELP_COPY.view.title}</KkHelp.Title>
        <KkHelp.Text>{ALBUM_HELP_COPY.view.text}</KkHelp.Text>
        <KkHelp.Text>{ALBUM_HELP_COPY.view.original}</KkHelp.Text>
        <KkHelp.Text>{ALBUM_HELP_COPY.view.rail}</KkHelp.Text>
        <ScreenHelpShow spot={ALBUM_HELP_SPOTS.scenes} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ALBUM_HELP_COPY.filter.title}</KkHelp.Title>
        <KkHelp.Text>{ALBUM_HELP_COPY.filter.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ALBUM_HELP_COPY.zip.title}</KkHelp.Title>
        <KkHelp.Text>{ALBUM_HELP_COPY.zip.text}</KkHelp.Text>
      </KkHelp.Hint>
      {upload}
      {select}
      {shelf}
      {edit}
    </ScreenHelp>
  );
};
