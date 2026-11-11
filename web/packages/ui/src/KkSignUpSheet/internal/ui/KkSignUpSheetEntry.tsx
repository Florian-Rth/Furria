import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { KkButton } from '../../../KkButton';
import { KkTextField } from '../../../KkTextField';
import type { KkSx } from '../../../kk-sx';

interface KkSignUpSheetEntryProps {
  name: string;
  label: string;
  value: string;
  maxLength: number;
  saveLabel: string;
  canSave: boolean;
  saving?: boolean;
  autoFocus?: boolean;
  cancelLabel?: string;
  removeLabel?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  onRemove?: () => void;
  sx?: KkSx;
}

export const KkSignUpSheetEntry: FC<KkSignUpSheetEntryProps> = ({
  name,
  label,
  value,
  maxLength,
  saveLabel,
  canSave,
  saving = false,
  autoFocus = false,
  cancelLabel,
  removeLabel,
  onChange,
  onSave,
  onCancel,
  onRemove,
  sx,
}) => {
  const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onChange(event.target.value);
  };
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (canSave) {
      onSave();
    }
  };
  const removeButton =
    removeLabel === undefined || onRemove === undefined ? null : (
      <KkButton variant="text" size="small" tone="danger" disabled={saving} onClick={onRemove}>
        {removeLabel}
      </KkButton>
    );
  const cancelButton =
    cancelLabel === undefined || onCancel === undefined ? null : (
      <KkButton variant="text" size="small" disabled={saving} onClick={onCancel}>
        {cancelLabel}
      </KkButton>
    );
  const secondaryActions =
    removeButton === null && cancelButton === null ? null : (
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        {removeButton}
        {cancelButton}
      </Stack>
    );

  return (
    <Stack
      component="form"
      noValidate
      onSubmit={submit}
      data-kk-sign-up-sheet-entry
      sx={[{ gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <KkTextField
          name={name}
          label={label}
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          maxLength={maxLength}
          onChange={change}
          sx={{ flexGrow: 1, minWidth: 0 }}
        />
        <KkButton type="submit" disabled={!canSave} loading={saving}>
          {saveLabel}
        </KkButton>
      </Stack>
      {secondaryActions}
    </Stack>
  );
};
