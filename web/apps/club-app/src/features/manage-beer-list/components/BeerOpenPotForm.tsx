import { KkButton } from '@furria/ui/KkButton';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { EMPTY_TITLE, OPEN_POT_LABEL, OWNER_LABEL } from '../beer-hub-copy';
import { useOpenPotForm } from '../hooks/use-open-pot-form';
import { BeerPotPersonField } from './BeerPotPersonField';
import { BeerPotSettingsFields } from './BeerPotSettingsFields';
import { BeerRejection } from './BeerRejection';

interface BeerOpenPotFormProps {
  owner: PersonRef | null;
}

export const BeerOpenPotForm: FC<BeerOpenPotFormProps> = ({ owner }) => {
  const form = useOpenPotForm(owner);

  return (
    <KkPanelSection title={EMPTY_TITLE}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <BeerPotPersonField label={OWNER_LABEL} fields={form.fields} />
        <BeerPotSettingsFields fields={form.fields} />
        <BeerRejection rejection={form.rejection} />
        <KkButton
          variant="contained"
          size="large"
          disabled={!form.canSubmit}
          loading={form.isSaving}
          onClick={form.submit}
        >
          {OPEN_POT_LABEL}
        </KkButton>
      </Stack>
    </KkPanelSection>
  );
};
