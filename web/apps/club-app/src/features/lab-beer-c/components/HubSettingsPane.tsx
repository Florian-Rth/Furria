import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkLedgerPrintSheet } from '@furria/ui/KkLedgerPrintSheet';
import { KkPriceField } from '@furria/ui/KkPriceField';
import { KkReservedSlot } from '@furria/ui/KkReservedSlot';
import { KkStepPane } from '@furria/ui/KkStepPane';
import { KkText } from '@furria/ui/KkText';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC, ReactNode } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerWorldState } from '@/features/lab-beer/use-lab-beer-world';
import { useHubSettings } from '../hooks/use-hub-settings';
import {
  HANDOVER_TEXT,
  HANDOVER_TITLE,
  LINK_FIELD,
  NOTE_FIELD,
  PRICE_FIELD,
  PRICE_INVALID,
  PRICE_NOTE,
  PRINT_ACTION,
  QR_EYEBROW,
  QR_HEADLINE,
  QR_LABEL,
  QR_TITLE,
  qrLines,
  SAVE_SETTINGS,
  SAVED,
  SETTINGS_TITLE,
} from '../ledger-copy';

const SOON = 'kommt noch';
const ICON_SX = { width: '1.125rem', height: '1.125rem' } as const;

interface HubSettingsPaneProps {
  beer: LabBeerWorldState;
  framed: boolean;
  close: ReactNode;
}

type FieldEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

export const HubSettingsPane: FC<HubSettingsPaneProps> = ({ beer, framed, close }) => {
  const settings = useHubSettings(beer);
  const { pot } = beer.world;
  const owner = labBeerPersonOf(pot.ownerId);
  const ownerName = owner === null ? '' : `${owner.firstName} ${owner.lastName}`;
  const lines = qrLines(ownerName, euroOf(pot.priceCents));
  const priceHelp = settings.priceInvalid ? PRICE_INVALID : PRICE_NOTE;
  const saveLabel = settings.saved ? SAVED : SAVE_SETTINGS;
  const saveIcon = settings.saved ? 'check' : 'edit';
  const changeLink = (event: FieldEvent): void => {
    settings.setLink(event.target.value);
  };
  const changeNote = (event: FieldEvent): void => {
    settings.setNote(event.target.value);
  };

  return (
    <KkStepPane label={SETTINGS_TITLE} framed={framed}>
      <KkStepPane.Head
        icon="settings"
        title={SETTINGS_TITLE}
        context={ownerName}
        state="open"
        stateLabel=""
        actions={close}
      />
      <KkStepPane.Body>
        <Stack component="section" aria-label={SETTINGS_TITLE} sx={{ gap: 1.5 }}>
          <KkPriceField
            name="price"
            label={PRICE_FIELD}
            value={settings.price}
            onChange={settings.setPrice}
            error={settings.priceInvalid}
            helperText={priceHelp}
          />
          <KkTextField
            name="paymentLink"
            label={LINK_FIELD}
            type="url"
            value={settings.link}
            onChange={changeLink}
          />
          <KkTextField
            name="paymentNote"
            label={NOTE_FIELD}
            value={settings.note}
            onChange={changeNote}
          />
          <KkButton
            variant="outlined"
            startIcon={<KkIcon name={saveIcon} sx={ICON_SX} />}
            onClick={settings.save}
          >
            {saveLabel}
          </KkButton>
        </Stack>
        <Stack component="section" aria-label={QR_TITLE} sx={{ gap: 1.25 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <KkEyebrow>{QR_TITLE}</KkEyebrow>
            <KkButton
              variant="text"
              size="small"
              startIcon={<KkIcon name="download" sx={ICON_SX} />}
              onClick={settings.print}
            >
              {PRINT_ACTION}
            </KkButton>
          </Stack>
          <KkLedgerPrintSheet
            value={settings.bookingUrl}
            qrLabel={QR_LABEL}
            eyebrow={QR_EYEBROW}
            title={QR_HEADLINE}
            lines={lines}
          />
          <KkText variant="caption" tone="secondary">
            {settings.bookingUrl}
          </KkText>
        </Stack>
        <KkReservedSlot
          icon="handshake"
          title={HANDOVER_TITLE}
          description={HANDOVER_TEXT}
          badge={SOON}
        />
      </KkStepPane.Body>
    </KkStepPane>
  );
};
