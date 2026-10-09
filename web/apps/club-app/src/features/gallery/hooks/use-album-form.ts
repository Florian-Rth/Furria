import { useKkSheetCommands } from '@furria/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toFormFailures } from '@/lib/api/api-failures';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toAlbumFormValues, toAlbumPayload, toAlbumUpdatePayload } from '../album-form';
import { useAlbumCreation, useAlbumUpdate } from '../api';
import { ALBUM_ROUTE } from '../gallery-copy';
import type { AlbumDetails, AlbumForm } from '../schemas';
import { AlbumFormSchema, AlbumLinkSchema } from '../schemas';

const FIELD_NAMES = ['title', 'description', 'calendarEntryId', 'sessionStartYear'] as const;
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
  const [rejection, setRejection] = useState<string | null>(null);
  const creation = useAlbumCreation();
  const update = useAlbumUpdate();
  const navigate = useNavigate();
  const goBackTo = useGoBackTo();
  const sheet = useKkSheetCommands();

  const form = useForm<AlbumForm>({
    resolver: zodResolver(AlbumFormSchema),
    defaultValues: toAlbumFormValues(album, presetEntryId),
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const values = form.watch();

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);
    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }
    const fallback = failures.fields.length === 0 ? toWriteErrorMessage(error) : null;
    setRejection(failures.footer ?? fallback);
  };

  const openAlbum = (albumId: number): void => {
    void navigate({
      to: ALBUM_ROUTE,
      params: { albumId: String(albumId) },
      replace: true,
      ignoreBlocker: true,
    });
  };

  const backToAlbum = (albumId: number): void => {
    void goBackTo({ to: ALBUM_ROUTE, params: { albumId: String(albumId) }, ignoreBlocker: true });
  };

  const handleSubmit = form.handleSubmit((submitted) => {
    setRejection(null);
    if (album === null) {
      creation.mutate(toAlbumPayload(submitted), {
        onSuccess: (created) => openAlbum(created.albumId),
        onError: showFailure,
      });
      return;
    }
    update.mutate(
      { albumId: album.albumId, payload: toAlbumUpdatePayload(submitted) },
      { onSuccess: () => backToAlbum(album.albumId), onError: showFailure },
    );
  });

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
    isDirty,
    canSubmit: isValid,
    isSaving: creation.isPending || update.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
