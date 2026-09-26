import { KkAlert, KkButton, KkHeading, KkNote, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { LOGIN_PATH } from '@/lib/return-to';
import { useCodeEntry } from '../hooks/use-code-entry';
import { RedeemFrame } from './RedeemFrame';

const TITLE = 'CODE EINGEBEN';
const INTRO =
  'Jemand vom Verein zeigt dir den Code auf dem Handy. Er hat acht Zeichen, zum Beispiel K7M4-Q2XP.';
const CODE_LABEL = 'Code';
const CODE_HINT = 'Groß- und Kleinschreibung ist egal.';
const SUBMIT_LABEL = 'Weiter';
const LOGIN_LABEL = 'Zur Anmeldung';

export const CodeEntryScreen: FC = () => {
  const control = useCodeEntry();
  const hasRefusal = control.refusal !== null;
  const refusalAlert = hasRefusal ? <KkAlert>{control.refusal}</KkAlert> : null;

  return (
    <RedeemFrame>
      <Stack sx={{ gap: 2.5, minWidth: 0 }}>
        <Stack sx={{ gap: 1 }}>
          <KkHeading level={1} component="h1">
            {TITLE}
          </KkHeading>
          <KkNote>{INTRO}</KkNote>
        </Stack>
        <Stack component="form" noValidate onSubmit={control.submit} sx={{ gap: 2.5 }}>
          <KkTextField
            name="code"
            label={CODE_LABEL}
            autoComplete="off"
            autoFocus
            required
            value={control.code}
            error={hasRefusal}
            helperText={CODE_HINT}
            onChange={control.change}
          />
          {refusalAlert}
          <KkButton
            type="submit"
            fullWidth
            disabled={!control.canSubmit}
            loading={control.isLookingUp}
          >
            {SUBMIT_LABEL}
          </KkButton>
        </Stack>
        <KkButton variant="text" fullWidth component={Link} to={LOGIN_PATH}>
          {LOGIN_LABEL}
        </KkButton>
      </Stack>
    </RedeemFrame>
  );
};
