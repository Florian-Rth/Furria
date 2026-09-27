import { KkAlert, KkButton, KkHeading, KkIcon, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePasskeyOffer } from '../hooks/use-passkey-offer';

const TITLE = 'MIT FINGERABDRUCK ANMELDEN?';
const LINE =
  'Du bist drin. Richte jetzt einen Passkey ein, dann meldest du dich auf diesem Gerät ohne Passwort an – per Fingerabdruck, Gesicht oder Displaysperre.';
const LATER_LINE = 'Du kannst ihn auch später unter Anmeldung & Sicherheit einrichten.';
const SET_UP_LABEL = 'Einrichten';
const LATER_LABEL = 'Später';

interface RedeemPasskeyOfferProps {
  onDone: () => void;
}

export const RedeemPasskeyOffer: FC<RedeemPasskeyOfferProps> = ({ onDone }) => {
  const control = usePasskeyOffer(onDone);
  const fingerprintIcon = <KkIcon name="fingerprint" size="small" />;
  const rejection = control.rejection === null ? null : <KkAlert>{control.rejection}</KkAlert>;

  return (
    <Stack sx={{ gap: 2.5, minWidth: 0 }}>
      <Stack sx={{ gap: 1 }}>
        <KkHeading level={1} component="h1">
          {TITLE}
        </KkHeading>
        <KkNote>{LINE}</KkNote>
      </Stack>
      {rejection}
      <Stack sx={{ gap: 1.25 }}>
        <KkButton
          fullWidth
          startIcon={fingerprintIcon}
          loading={control.isSettingUp}
          onClick={control.setUp}
        >
          {SET_UP_LABEL}
        </KkButton>
        <KkButton variant="text" fullWidth disabled={control.isSettingUp} onClick={onDone}>
          {LATER_LABEL}
        </KkButton>
      </Stack>
      <KkNote>{LATER_LINE}</KkNote>
    </Stack>
  );
};
