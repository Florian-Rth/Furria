import { useState } from 'react';
import type { FieldErrors, UseFormReturn } from 'react-hook-form';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import { useUpdateClubStageMutation } from '../api';
import { toClubStage, toClubStageForm, toSectionLanding } from '../club-record-labels';
import type { ClubRecord, ClubStageForm } from '../schemas';
import { ClubStageFormSchema } from '../schemas';
import {
  toStageArtworkFileRejection,
  toStageArtworkTextRejection,
  UNREADABLE_ARTWORK_MESSAGE,
} from '../stage-artwork-file';
import type { StageArtworkFit } from '../stage-artwork-fit';
import { stageArtworkFitOf } from '../stage-artwork-fit';
import type { StageSize } from '../stage-metres';
import { stageSizeOf } from '../stage-metres';

export interface ClubStageEditorControl {
  form: UseFormReturn<ClubStageForm>;
  errors: FieldErrors<ClubStageForm>;
  stageSize: StageSize | null;
  artworkSvg: string | null;
  artworkFit: StageArtworkFit | null;
  artworkRejection: string | null;
  takeArtworkFile: (file: File | null) => void;
  clearArtwork: () => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useClubStageEditor = (record: ClubRecord): ClubStageEditorControl => {
  const [fileRejection, setFileRejection] = useState<string | null>(null);
  const mutation = useUpdateClubStageMutation();

  const write = useWriteForm({
    schema: ClubStageFormSchema,
    defaults: toClubStageForm(record),
    mutate: (values) => {
      const stage = toClubStage(values);

      return stage === null ? null : mutation.mutateAsync(stage);
    },
    landing: () => toSectionLanding('stage'),
  });
  const { form, values } = write;
  const errors = form.formState.errors;

  const stageSize = stageSizeOf(values.widthMetres, values.depthMetres);
  const artworkSvg = values.artworkSvg;
  const artworkFit = artworkSvg === null ? null : stageArtworkFitOf(artworkSvg, stageSize);

  const setArtwork = (value: string | null): void => {
    form.setValue('artworkSvg', value, { shouldValidate: true, shouldDirty: true });
  };

  const clearArtwork = (): void => {
    setFileRejection(null);
    setArtwork(null);
  };

  const takeArtworkFile = (file: File | null): void => {
    if (file === null) {
      return;
    }

    const refusal = toStageArtworkFileRejection({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (refusal !== null) {
      setFileRejection(refusal);
      return;
    }

    const reader = new FileReader();

    reader.onload = (): void => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const textRefusal = toStageArtworkTextRejection(text);

      if (textRefusal !== null) {
        setFileRejection(textRefusal);
        return;
      }

      setFileRejection(null);
      setArtwork(text);
    };
    reader.onerror = (): void => {
      setFileRejection(UNREADABLE_ARTWORK_MESSAGE);
    };
    reader.readAsText(file);
  };

  return {
    form,
    errors,
    stageSize,
    artworkSvg,
    artworkFit,
    artworkRejection: fileRejection ?? errors.artworkSvg?.message ?? null,
    takeArtworkFile,
    clearArtwork,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
