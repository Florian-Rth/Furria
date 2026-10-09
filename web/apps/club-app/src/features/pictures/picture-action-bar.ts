import type { KkScreenActionBar } from '@furria/ui';
import type { PictureEditorControl } from './hooks/use-picture-editor';
import { PICTURE_ACTION_LABELS, toUploadProgressLine } from './picture-labels';

export const toPictureActionBar = (
  control: PictureEditorControl,
  openPicker: () => void,
): KkScreenActionBar => {
  const { phase } = control;
  const cancel = { label: PICTURE_ACTION_LABELS.cancel, onSelect: control.cancel };

  switch (phase.kind) {
    case 'view':
      return {
        primary: { label: PICTURE_ACTION_LABELS.choose, icon: 'add', onSelect: openPicker },
      };
    case 'choosing':
      return {
        primary: {
          label: PICTURE_ACTION_LABELS.upload,
          onSelect: control.submit,
          disabled: !control.canSubmit,
        },
        secondary: { label: PICTURE_ACTION_LABELS.chooseOther, onSelect: openPicker },
      };
    case 'recropping':
      return {
        primary: {
          label: PICTURE_ACTION_LABELS.saveCrop,
          onSelect: control.submit,
          disabled: !control.canSubmit,
          loading: control.isSaving,
        },
        secondary: cancel,
      };
    case 'uploading':
      return {
        context: { text: toUploadProgressLine(phase.share), tone: 'quiet' },
        primary: {
          label: PICTURE_ACTION_LABELS.upload,
          onSelect: control.submit,
          loading: true,
        },
      };
  }
};
