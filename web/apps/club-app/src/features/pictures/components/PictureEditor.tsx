import type { KkGroupTone, KkScreenOrigin } from '@furria/ui';
import { KkConfirmDialog, KkCropFrame, KkNote, KkWriteScreen } from '@furria/ui';
import type { ChangeEvent, FC } from 'react';
import { useRef } from 'react';
import { WriteScreen } from '@/features/write';
import type { PictureEditing } from '@/lib/api/schemas';
import { toPictureSources } from '@/lib/pictures';
import { usePictureEditor } from '../hooks/use-picture-editor';
import { toPictureActionBar } from '../picture-action-bar';
import {
  PICTURE_ACTION_LABELS,
  PICTURE_COPY,
  PICTURE_STATE_NOTES,
  UNREADABLE_PHOTO_NOTE,
} from '../picture-labels';
import type { PictureTarget } from '../picture-target';
import { PICTURE_ACCEPT, toPictureAspect } from '../picture-target';
import { PicturePreview } from './PicturePreview';

interface PictureEditorProps {
  target: PictureTarget;
  editing: PictureEditing | null;
  origin: KkScreenOrigin;
  alt: string;
  placeholderLabel: string;
  tone?: KkGroupTone;
  refresh: () => void;
}

export const PictureEditor: FC<PictureEditorProps> = ({
  target,
  editing,
  origin,
  alt,
  placeholderLabel,
  tone,
  refresh,
}) => {
  const control = usePictureEditor({ target, editing, refresh });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const copy = PICTURE_COPY[target.kind];
  const aspect = toPictureAspect(target.kind);
  const { phase, removal } = control;
  const current = toPictureSources(editing?.picture ?? null, aspect);

  const openPicker = (): void => {
    inputRef.current?.click();
  };

  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    control.choose(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const stateNote = editing === null ? copy.emptyNote : PICTURE_STATE_NOTES[editing.state];
  const note = stateNote === null ? null : <KkNote>{stateNote}</KkNote>;

  const recropLine = control.canRecrop ? (
    <KkWriteScreen.Quiet label={PICTURE_ACTION_LABELS.recrop} onSelect={control.recrop} />
  ) : null;

  const removeLine =
    editing === null ? null : (
      <KkWriteScreen.Danger label={copy.removeLabel} onSelect={removal.open} />
    );

  const view = (
    <>
      <PicturePreview
        aspectRatio={copy.aspectRatio}
        alt={alt}
        placeholderLabel={placeholderLabel}
        source={current.source}
        sourceSet={current.sourceSet}
        tone={tone}
      />
      {note}
      {recropLine}
      {removeLine}
    </>
  );

  const cropping =
    phase.kind === 'choosing' || phase.kind === 'recropping' ? (
      <KkCropFrame
        key={phase.source}
        source={phase.source}
        alt={alt}
        aspect={aspect}
        initialCrop={control.initialCrop}
        guide={copy.guide}
        labels={copy.frame}
        onCropChange={control.setCrop}
        onUnreadable={control.unreadable}
      />
    ) : null;

  const unreadableNote =
    phase.kind === 'uploading' && !phase.cropped ? <KkNote>{UNREADABLE_PHOTO_NOTE}</KkNote> : null;

  const uploading =
    phase.kind === 'uploading' ? (
      <>
        <PicturePreview
          aspectRatio={copy.aspectRatio}
          alt={alt}
          placeholderLabel={placeholderLabel}
          source={undefined}
          sourceSet={undefined}
          tone={tone}
        />
        {unreadableNote}
      </>
    ) : null;

  const body = phase.kind === 'view' ? view : (cropping ?? uploading);
  const action = toPictureActionBar(control, openPicker);

  return (
    <WriteScreen
      origin={origin}
      title={copy.title}
      rejection={control.rejection ?? undefined}
      isDirty={phase.kind !== 'view'}
      action={action}
    >
      <input hidden ref={inputRef} type="file" accept={PICTURE_ACCEPT} onChange={change} />
      {body}
      <KkConfirmDialog
        open={removal.isOpen}
        onClose={removal.close}
        onConfirm={removal.submit}
        tone="danger"
        eyebrow={copy.noun}
        question={copy.removeQuestion}
        explanation={copy.removeExplanation}
        facts={[]}
        error={removal.rejection ?? undefined}
        confirmLabel={copy.removeLabel}
        cancelLabel={PICTURE_ACTION_LABELS.cancel}
        closeLabel={PICTURE_ACTION_LABELS.close}
        busy={removal.isSaving}
      />
    </WriteScreen>
  );
};
