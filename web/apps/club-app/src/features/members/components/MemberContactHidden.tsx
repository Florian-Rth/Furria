import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkRedactedValue } from '@furria/ui/KkRedactedValue';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SELF_CONTACT_HIDDEN_LINK } from '../members-labels';

const HIDDEN_TITLE = 'Kontaktdaten sind hinterlegt, aber nicht freigegeben';
const PRIVATE_PLACEHOLDER = 'privat';
const PROFILE_PATH = '/profile';

interface MemberContactHiddenProps {
  isSelf?: boolean;
}

export const MemberContactHidden: FC<MemberContactHiddenProps> = ({ isSelf = false }) => {
  const profileLink = isSelf ? (
    <Stack sx={{ minWidth: 0, alignItems: 'flex-start' }}>
      <KkInlineLink component={Link} to={PROFILE_PATH}>
        {SELF_CONTACT_HIDDEN_LINK}
      </KkInlineLink>
    </Stack>
  ) : null;

  return (
    <KkPanel variant="block" sx={{ gap: 1.25 }}>
      <KkText variant="subtitle2" component="p">
        {HIDDEN_TITLE}
      </KkText>
      {profileLink}
      <Stack sx={{ gap: 1.75, pt: 0.75, minWidth: 0 }}>
        <KkRedactedValue label="Telefon" placeholder={PRIVATE_PLACEHOLDER} width="short" />
        <KkRedactedValue label="E-Mail" placeholder={PRIVATE_PLACEHOLDER} width="medium" />
        <KkRedactedValue label="Adresse" placeholder={PRIVATE_PLACEHOLDER} width="long" />
      </Stack>
    </KkPanel>
  );
};
