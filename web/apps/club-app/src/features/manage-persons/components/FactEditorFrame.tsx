import { KkAlert, KkButton, KkConsequenceNote, KkPanel, KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

const CANCEL_LABEL = 'Abbrechen';

interface FactEditorFrameProps extends PropsWithChildren {
  title: string;
  consequence: string;
  rejection: string | null;
  confirmLabel: string;
  isSaving: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const FactEditorFrame: FC<FactEditorFrameProps> = ({
  title,
  consequence,
  rejection,
  confirmLabel,
  isSaving,
  canSubmit,
  onCancel,
  onSubmit,
  children,
}) => {
  const alert = rejection === null ? null : <KkAlert severity="error">{rejection}</KkAlert>;
  const note = consequence === '' ? null : <KkConsequenceNote>{consequence}</KkConsequenceNote>;

  return (
    <KkPanel variant="block" tone="editing">
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkPanelHeader title={title} size="medium" />
        <Stack sx={{ gap: 1.75, minWidth: 0 }}>{children}</Stack>
        {note}
        {alert}
        <Stack
          direction="row"
          sx={{ gap: 1.25, minWidth: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}
        >
          <KkButton variant="outlined" onClick={onCancel} disabled={isSaving}>
            {CANCEL_LABEL}
          </KkButton>
          <KkButton onClick={onSubmit} loading={isSaving} disabled={!canSubmit}>
            {confirmLabel}
          </KkButton>
        </Stack>
      </Stack>
    </KkPanel>
  );
};
