import { KkButton } from '@furria/ui/KkButton';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub/components/PersonPicker';
import { EMPTY_LEAD, EMPTY_TITLE, OPEN_POT_LABEL, OWNER_LABEL } from '../beer-hub-copy';
import { useOpenPotForm } from '../hooks/use-open-pot-form';
import { BeerPotSettingsFields } from './BeerPotSettingsFields';

export const BeerOpenPotForm: FC = () => {
  const form = useOpenPotForm();

  return (
    <KkPanelSection title={EMPTY_TITLE}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkText variant="body2" tone="secondary">
          {EMPTY_LEAD}
        </KkText>
        <KkText variant="subtitle2">{OWNER_LABEL}</KkText>
        <PersonPicker selected={form.owner} onSelect={form.chooseOwner} onClear={form.clearOwner} />
        <BeerPotSettingsFields form={form.settings} />
        <KkButton variant="contained" size="large" disabled={!form.canSubmit} onClick={form.submit}>
          {OPEN_POT_LABEL}
        </KkButton>
      </Stack>
    </KkPanelSection>
  );
};
