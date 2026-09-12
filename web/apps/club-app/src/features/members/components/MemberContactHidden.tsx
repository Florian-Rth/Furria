import { KkNote, KkPanel, KkRedactedValue, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toContactHiddenExplanation } from '../members-labels';

const HIDDEN_TITLE = 'Kontaktdaten sind hinterlegt, aber nicht freigegeben';
const PRIVATE_PLACEHOLDER = 'privat';

interface MemberContactHiddenProps {
  firstName: string;
}

export const MemberContactHidden: FC<MemberContactHiddenProps> = ({ firstName }) => (
  <KkPanel variant="block" tone="cream" sx={{ gap: 1.25 }}>
    <KkText variant="subtitle2" component="p">
      {HIDDEN_TITLE}
    </KkText>
    <KkNote>{toContactHiddenExplanation(firstName)}</KkNote>
    <Stack sx={{ gap: 1.75, pt: 0.75, minWidth: 0 }}>
      <KkRedactedValue label="Telefon" placeholder={PRIVATE_PLACEHOLDER} width="short" />
      <KkRedactedValue label="E-Mail" placeholder={PRIVATE_PLACEHOLDER} width="medium" />
      <KkRedactedValue label="Adresse" placeholder={PRIVATE_PLACEHOLDER} width="long" />
    </Stack>
  </KkPanel>
);
