import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkQrCode } from '@furria/ui/KkQrCode';
import { KkTextArea } from '@furria/ui/KkTextArea';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { LabBeerRefusal } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerPot } from '@/features/lab-beer/beer-lab-types';
import type { BeerAPotDraft } from '../beer-a-access';
import {
  LINK_LABEL,
  NOTE_LABEL,
  PALLET_LABEL,
  PALLET_NOTE,
  PALLET_TITLE,
  PRICE_ERROR,
  PRICE_HINT,
  PRICE_LABEL,
  PRINT_LABEL,
  SAVE_LABEL,
  SAVED_LABEL,
  SETTINGS_PANE,
} from '../beer-a-copy';
import { usePotSettings } from '../hooks/use-pot-settings';

interface BeerHubASettingsPaneProps {
  pot: LabBeerPot;
  saveSettings: (draft: BeerAPotDraft) => LabBeerRefusal | null;
}

export const BeerHubASettingsPane: FC<BeerHubASettingsPaneProps> = ({ pot, saveSettings }) => {
  const settings = usePotSettings(pot, saveSettings);
  const priceHelper = settings.priceInvalid ? PRICE_ERROR : PRICE_HINT;
  const saveText = settings.saved ? SAVED_LABEL : SAVE_LABEL;
  const saveIcon = settings.saved ? <KkIcon name="check" size="small" /> : undefined;
  const printIcon = <KkIcon name="download" size="small" />;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <KkPanelSection title={SETTINGS_PANE}>
        <KkPriceField
          name="price"
          label={PRICE_LABEL}
          value={settings.priceText}
          onChange={settings.changePrice}
          error={settings.priceInvalid}
          helperText={priceHelper}
        />
        <KkTextArea
          name="payment-link"
          label={LINK_LABEL}
          value={settings.link}
          onChange={settings.changeLink}
          rows={1}
        />
        <KkTextArea
          name="payment-note"
          label={NOTE_LABEL}
          value={settings.note}
          onChange={settings.changeNote}
          rows={2}
        />
        <KkButton
          fullWidth
          disabled={settings.priceInvalid}
          startIcon={saveIcon}
          onClick={settings.save}
        >
          {saveText}
        </KkButton>
      </KkPanelSection>
      <KkPanelSection title={PALLET_TITLE}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center', minWidth: 0 }}>
          <KkQrCode value={settings.bookingUrl} label={PALLET_LABEL} sx={{ width: '40%' }} />
          <Stack sx={{ flex: 1, gap: 1.5, minWidth: 0 }}>
            <KkMeta>{PALLET_NOTE}</KkMeta>
            <KkButton variant="outlined" startIcon={printIcon} onClick={settings.print}>
              {PRINT_LABEL}
            </KkButton>
          </Stack>
        </Stack>
      </KkPanelSection>
    </Stack>
  );
};
