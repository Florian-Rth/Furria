import type { KkScreenActionBar, KkScreenOrigin } from '@furria/ui';
import { KkFormSection, KkTextArea, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import { GALLERY_ORIGIN } from '@/features/session';
import { WriteScreen } from '@/features/write';
import { EDIT_ALBUM_TITLE, NEW_ALBUM_TITLE } from '../gallery-copy';
import { useAlbumForm } from '../hooks/use-album-form';
import { useAlbumFormEntries } from '../hooks/use-album-form-entries';
import type { AlbumDetails } from '../schemas';
import { ALBUM_DESCRIPTION_MAX_LENGTH } from '../schemas';
import { AlbumFormCoverField } from './AlbumFormCoverField';
import { AlbumFormCoverSheet } from './AlbumFormCoverSheet';
import { AlbumFormDeletionLine } from './AlbumFormDeletionLine';
import { AlbumFormLinkSection } from './AlbumFormLinkSection';

const CREATE_LABEL = 'Anlegen';
const SAVE_LABEL = 'Speichern';
const ALBUM_SECTION_TITLE = 'Album';
const COVER_SECTION_TITLE = 'Titelbild';
const TITLE_LABEL = 'Titel';
const DESCRIPTION_LABEL = 'Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Ein, zwei Sätze zum Abend';
const DESCRIPTION_HINT =
  'Steht über dem Album und, bei Alben mit Session, auf seiner Seite auf der Website.';
const DESCRIPTION_ROWS = 3;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface AlbumFormEditorProps {
  album: AlbumDetails | null;
  presetEntryId: number | null;
}

const originOf = (album: AlbumDetails | null): KkScreenOrigin =>
  album === null
    ? GALLERY_ORIGIN
    : { label: album.title, to: '/gallery/$albumId', params: { albumId: String(album.albumId) } };

export const AlbumFormEditor: FC<AlbumFormEditorProps> = ({ album, presetEntryId }) => {
  const control = useAlbumForm(album, presetEntryId);
  const entries = useAlbumFormEntries(album?.calendarEntry ?? null);
  const titleField = control.form.register('title');
  const errors = control.form.formState.errors;
  const titleErrorText = errors.title?.message;
  const descriptionErrorText = errors.description?.message;
  const title = control.isEditing ? EDIT_ALBUM_TITLE : NEW_ALBUM_TITLE;
  const actionLabel = control.isEditing ? SAVE_LABEL : CREATE_LABEL;
  const origin = originOf(album);
  const coverSection =
    album === null ? null : (
      <KkFormSection title={COVER_SECTION_TITLE}>
        <AlbumFormCoverField album={album} control={control} />
      </KkFormSection>
    );
  const coverSheet =
    album === null ? null : <AlbumFormCoverSheet items={album.items} control={control} />;
  const deletionLine = album === null ? null : <AlbumFormDeletionLine album={album} />;
  const rejection = control.rejection ?? undefined;
  const action: KkScreenActionBar = {
    primary: {
      label: actionLabel,
      onSelect: control.submit,
      loading: control.isSaving,
      disabled: !control.canSubmit,
    },
  };

  return (
    <>
      <WriteScreen
        origin={origin}
        title={title}
        rejection={rejection}
        isDirty={control.isDirty}
        action={action}
      >
        <KkFormSection title={ALBUM_SECTION_TITLE}>
          <KkTextField
            name={titleField.name}
            label={TITLE_LABEL}
            required
            error={titleErrorText !== undefined}
            helperText={titleErrorText}
            onChange={titleField.onChange}
            onBlur={titleField.onBlur}
            inputRef={titleField.ref}
          />
          <KkTextArea
            name="description"
            label={DESCRIPTION_LABEL}
            value={control.values.description}
            onChange={control.setDescription}
            rows={DESCRIPTION_ROWS}
            maxLength={ALBUM_DESCRIPTION_MAX_LENGTH}
            showCount
            countLabel={toCountLabel}
            placeholder={DESCRIPTION_PLACEHOLDER}
            hint={DESCRIPTION_HINT}
            error={descriptionErrorText !== undefined}
            helperText={descriptionErrorText}
          />
        </KkFormSection>
        <AlbumFormLinkSection control={control} entries={entries} />
        {coverSection}
        {deletionLine}
      </WriteScreen>
      {coverSheet}
    </>
  );
};
