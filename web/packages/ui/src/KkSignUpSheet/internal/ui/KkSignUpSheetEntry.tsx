import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { KkButton } from '../../../KkButton';
import { KkIconButton } from '../../../KkIconButton';
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
  removeLabel?: string;
  onChange: (value: string) => void;
  onSave: () => void;
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
  removeLabel,
  onChange,
  onSave,
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
      <KkIconButton label={removeLabel} icon="delete" disabled={saving} onClick={onRemove} />
    );

  return (
    <Stack
      component="form"
      direction="row"
      noValidate
      onSubmit={submit}
      data-kk-sign-up-sheet-entry
      sx={[{ alignItems: 'center', gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkTextField
        name={name}
        label={label}
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        onChange={change}
        sx={{ flexGrow: 1, minWidth: 0 }}
      />
      <KkButton type="submit" disabled={!canSave} loading={saving}>
        {saveLabel}
      </KkButton>
      {removeButton}
    </Stack>
  );
};
