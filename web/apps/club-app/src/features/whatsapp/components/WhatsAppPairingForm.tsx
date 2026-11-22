import { KkButton } from '@furria/ui/KkButton';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { WhatsAppLinkControl } from '../hooks/use-whatsapp-link';
import {
  PAIRING_CODE_LABEL,
  PAIRING_CODE_STEPS,
  PAIRING_PHONE_LABEL,
  PAIRING_REQUEST_LABEL,
} from '../whatsapp-copy';

interface WhatsAppPairingFormProps {
  link: WhatsAppLinkControl;
}

export const WhatsAppPairingForm: FC<WhatsAppPairingFormProps> = ({ link }) => {
  const codeRow =
    link.pairingCode === null ? null : (
      <Stack role="status" sx={{ gap: 1, minWidth: 0 }}>
        <KkFieldRow label={PAIRING_CODE_LABEL} value={link.pairingCode} />
        <KkNote tone="hint" icon="info">
          {PAIRING_CODE_STEPS}
        </KkNote>
      </Stack>
    );

  return (
    <Stack component="form" onSubmit={link.requestPairingCode} sx={{ gap: 1.5, minWidth: 0 }}>
      <KkTextField
        name="pairingPhone"
        label={PAIRING_PHONE_LABEL}
        type="tel"
        inputMode="tel"
        autoComplete="off"
        value={link.phoneNumber}
        onChange={link.changePhoneNumber}
      />
      <KkButton
        type="submit"
        variant="outlined"
        loading={link.isRequesting}
        disabled={!link.canRequest}
      >
        {PAIRING_REQUEST_LABEL}
      </KkButton>
      {codeRow}
    </Stack>
  );
};
