import { KkButton } from '@furria/ui/KkButton';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, FormEvent } from 'react';
import { CREATE_LABEL, TITLE_FIELD, TITLE_HINT } from '../upload-link-copy';

const TITLE_LENGTH = 80;

interface UploadLinkCreateFormProps {
  title: string;
  creating: boolean;
  canCreate: boolean;
  onTitle: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
}

export const UploadLinkCreateForm: FC<UploadLinkCreateFormProps> = ({
  title,
  creating,
  canCreate,
  onTitle,
  onCreate,
}) => (
  <Stack
    component="form"
    onSubmit={onCreate}
    direction="row"
    sx={{ columnGap: 1, alignItems: 'flex-start', minWidth: 0 }}
  >
    <KkTextField
      name="occasion"
      label={TITLE_FIELD}
      hint={TITLE_HINT}
      maxLength={TITLE_LENGTH}
      value={title}
      onChange={onTitle}
    />
    <KkButton type="submit" loading={creating} disabled={!canCreate}>
      {CREATE_LABEL}
    </KkButton>
  </Stack>
);
