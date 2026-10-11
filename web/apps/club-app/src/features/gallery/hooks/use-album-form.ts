import { useKkSheetCommands } from '@furria/ui';
import type { UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { toAlbumFormValues, toAlbumPayload, toAlbumUpdatePayload } from '../album-form';
import { useAlbumCreation, useAlbumUpdate } from '../api';
import { ALBUM_ROUTE } from '../gallery-copy';
import type { AlbumDetails, AlbumForm } from '../schemas';
import { AlbumFormSchema, AlbumLinkSchema } from '../schemas';

const FIELD_EDIT = { shouldDirty: true, shouldValidate: true } as const;
export const COVER_SHEET_ID = 'gallery-album-cover';

export interface AlbumFormControl {
  form: UseFormReturn<AlbumForm>;
  values: AlbumForm;
  setDescription: (value: string) => void;
  setLink: (value: string) => void;
  setEntry: (value: string) => void;
  setSession: (value: number | null) => void;
  chooseCover: (value: string) => void;
  openCoverSheet: () => void;
  isEditing: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useAlbumForm = (
  album: AlbumDetails | null,
  presetEntryId: number | null,
): AlbumFormControl => {
  const creation = useAlbumCreation();
  const update = useAlbumUpdate();
  const sheet = useKkSheetCommands();

  const write = useWriteForm({
    schema: AlbumFormSchema,
    defaults: toAlbumFormValues(album, presetEntryId),
    mutate: (submitted) =>
      album === null
        ? creation.mutateAsync(toAlbumPayload(submitted)).then((created) => created.albumId)
        : update
            .mutateAsync({ albumId: album.albumId, payload: toAlbumUpdatePayload(submitted) })
            .then(() => album.albumId),
    landing: (albumId) => ({ to: ALBUM_ROUTE, params: { albumId } }),
  });
  const { form } = write;
  const values = form.watch();

  return {
    form,
    values,
    setDescription: (value) => form.setValue('description', value, FIELD_EDIT),
    setLink: (value) => {
      const link = AlbumLinkSchema.safeParse(value);
      if (link.success) {
        form.setValue('link', link.data, FIELD_EDIT);
        void form.trigger(['calendarEntryId', 'sessionStartYear']);
      }
    },
    setEntry: (value) => form.setValue('calendarEntryId', value, FIELD_EDIT),
    setSession: (value) => form.setValue('sessionStartYear', value, FIELD_EDIT),
    chooseCover: (value) => {
      form.setValue('cover', value, FIELD_EDIT);
      sheet.close();
    },
    openCoverSheet: () => sheet.open(COVER_SHEET_ID),
    isEditing: album !== null,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
