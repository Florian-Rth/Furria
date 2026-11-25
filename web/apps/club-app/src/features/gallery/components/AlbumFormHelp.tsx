import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ALBUM_FORM_HELP_COPY, ALBUM_FORM_HELP_SPOTS } from '../album-form-help-copy';
import { AlbumFormHelpLinkPreview } from './AlbumFormHelpLinkPreview';

interface AlbumFormHelpProps {
  isEditing: boolean;
}

export const AlbumFormHelp: FC<AlbumFormHelpProps> = ({ isEditing }) => {
  const save = isEditing ? ALBUM_FORM_HELP_COPY.saveEdit : ALBUM_FORM_HELP_COPY.saveNew;

  const cover = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{ALBUM_FORM_HELP_COPY.cover.title}</KkHelp.Title>
      <KkHelp.Text>{ALBUM_FORM_HELP_COPY.cover.text}</KkHelp.Text>
      <ScreenHelpShow spot={ALBUM_FORM_HELP_SPOTS.cover} />
    </KkHelp.Hint>
  ) : null;

  const deletion = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{ALBUM_FORM_HELP_COPY.delete.title}</KkHelp.Title>
      <KkHelp.Text>{ALBUM_FORM_HELP_COPY.delete.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{ALBUM_FORM_HELP_COPY.album.title}</KkHelp.Title>
        <KkHelp.Text>{ALBUM_FORM_HELP_COPY.album.text}</KkHelp.Text>
        <ScreenHelpShow spot={ALBUM_FORM_HELP_SPOTS.album} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <AlbumFormHelpLinkPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{ALBUM_FORM_HELP_COPY.link.title}</KkHelp.Title>
        <KkHelp.Text>{ALBUM_FORM_HELP_COPY.link.text}</KkHelp.Text>
        <KkHelp.Text>{ALBUM_FORM_HELP_COPY.link.session}</KkHelp.Text>
        <KkHelp.Text>{ALBUM_FORM_HELP_COPY.link.website}</KkHelp.Text>
        <ScreenHelpShow spot={ALBUM_FORM_HELP_SPOTS.link} />
      </KkHelp.Hint>
      {cover}
      <KkHelp.Hint>
        <KkHelp.Title>{save.title}</KkHelp.Title>
        <KkHelp.Text>{save.text}</KkHelp.Text>
      </KkHelp.Hint>
      {deletion}
    </ScreenHelp>
  );
};
