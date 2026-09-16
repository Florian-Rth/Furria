import { KkButton, KkNote, KkPanel, KkSwitchRow, KkTextArea } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupInfoFormControl } from '../hooks/use-group-info-form';

const DESCRIPTION_LABEL = 'Über die Gruppe';
const DESCRIPTION_PLACEHOLDER = 'Was macht die Gruppe, wann trefft ihr euch?';
const DESCRIPTION_HINT = 'Ein paar Sätze über die Gruppe. Der Text steht so im Verzeichnis.';
const DESCRIPTION_MAX = 400;
const DESCRIPTION_ROWS = 5;

const OPENNESS_LABEL = 'Sucht Verstärkung';
const OPENNESS_DESCRIPTION = 'Zeigt im Verzeichnis, dass ihr gerade Leute aufnehmt.';

const NAME_NOTE = 'Den Namen der Gruppe ändert die Gruppenverwaltung.';
const CANCEL_LABEL = 'Abbrechen';
const SAVE_LABEL = 'Speichern';

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface HubCarePanelProps {
  form: GroupInfoFormControl;
}

export const HubCarePanel: FC<HubCarePanelProps> = ({ form }) => (
  <KkPanel variant="block" tone="editing">
    <Stack sx={{ gap: 2.25, minWidth: 0 }}>
      <KkTextArea
        name="description"
        label={DESCRIPTION_LABEL}
        value={form.description}
        onChange={form.setDescription}
        rows={DESCRIPTION_ROWS}
        maxLength={DESCRIPTION_MAX}
        showCount
        countLabel={toCountLabel}
        placeholder={DESCRIPTION_PLACEHOLDER}
        hint={DESCRIPTION_HINT}
      />
      <KkSwitchRow
        label={OPENNESS_LABEL}
        checked={form.isRecruiting}
        onChange={form.setRecruiting}
        description={OPENNESS_DESCRIPTION}
      />
      <KkNote>{NAME_NOTE}</KkNote>
      <Stack
        direction="row"
        sx={{ gap: 1.25, minWidth: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}
      >
        <KkButton variant="outlined" onClick={form.cancel} disabled={form.isSaving}>
          {CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={form.save} loading={form.isSaving} disabled={!form.isDirty}>
          {SAVE_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  </KkPanel>
);
