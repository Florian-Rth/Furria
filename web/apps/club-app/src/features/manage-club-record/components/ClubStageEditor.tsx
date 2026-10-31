import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write/WriteScreen';
import { CLUB_RECORD_ORIGIN, CLUB_RECORD_SECTION_TITLES } from '../club-record-labels';
import { useClubStageEditor } from '../hooks/use-club-stage-editor';
import type { ClubRecord } from '../schemas';
import { ClubStageArtworkField } from './ClubStageArtworkField';
import { ClubStagePreview } from './ClubStagePreview';

const SAVE_LABEL = 'Speichern';
const SIZE_SECTION_TITLE = 'Maße';
const WIDTH_LABEL = 'Breite';
const WIDTH_HINT = 'Von links nach rechts, entlang der Bühnenkante.';
const DEPTH_LABEL = 'Tiefe';
const DEPTH_HINT = 'Von der Bühnenkante nach hinten.';
const METRE_UNIT = 'm';
const ARTWORK_SECTION_TITLE = 'Bühnenzeichnung';
const PREVIEW_PENDING_NOTE = 'Die Vorschau erscheint, sobald Breite und Tiefe stimmen.';
const DISTORTED_NOTE =
  'Die Zeichnung hat ein anderes Seitenverhältnis als die Bühne und wird verzerrt dargestellt.';

const metreUnit = <KkMeta>{METRE_UNIT}</KkMeta>;

interface ClubStageEditorProps {
  record: ClubRecord;
}

export const ClubStageEditor: FC<ClubStageEditorProps> = ({ record }) => {
  const control = useClubStageEditor(record);
  const width = control.form.register('widthMetres');
  const depth = control.form.register('depthMetres');

  const widthError = control.errors.widthMetres?.message;
  const depthError = control.errors.depthMetres?.message;
  const hasArtwork = control.artworkSvg !== null;

  const preview =
    control.stageSize === null ? (
      <KkNote>{PREVIEW_PENDING_NOTE}</KkNote>
    ) : (
      <ClubStagePreview size={control.stageSize} artworkSvg={control.artworkSvg} />
    );

  const distortion =
    control.artworkFit === 'mismatch' ? (
      <KkNote tone="warning" icon="alert">
        {DISTORTED_NOTE}
      </KkNote>
    ) : null;

  const widthField = (
    <KkTextField
      name={width.name}
      label={WIDTH_LABEL}
      inputMode="decimal"
      autoComplete="off"
      endAdornment={metreUnit}
      error={widthError !== undefined}
      hint={WIDTH_HINT}
      helperText={widthError}
      onChange={width.onChange}
      onBlur={width.onBlur}
      inputRef={width.ref}
    />
  );

  const depthField = (
    <KkTextField
      name={depth.name}
      label={DEPTH_LABEL}
      inputMode="decimal"
      autoComplete="off"
      endAdornment={metreUnit}
      error={depthError !== undefined}
      hint={DEPTH_HINT}
      helperText={depthError}
      onChange={depth.onChange}
      onBlur={depth.onBlur}
      inputRef={depth.ref}
    />
  );

  return (
    <WriteScreen
      origin={CLUB_RECORD_ORIGIN}
      title={CLUB_RECORD_SECTION_TITLES.stage}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: SAVE_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <KkFormSection title={SIZE_SECTION_TITLE}>
        <KkFormPair start={widthField} end={depthField} phone="side" />
      </KkFormSection>
      <KkFormSection title={ARTWORK_SECTION_TITLE}>
        <ClubStageArtworkField
          hasArtwork={hasArtwork}
          rejection={control.artworkRejection}
          onPick={control.takeArtworkFile}
          onClear={control.clearArtwork}
        />
        {preview}
        {distortion}
      </KkFormSection>
    </WriteScreen>
  );
};
