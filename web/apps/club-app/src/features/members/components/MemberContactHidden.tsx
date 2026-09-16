import { KkInlineLink, KkNote, KkPanel, KkRedactedValue, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  SELF_CONTACT_HIDDEN_EXPLANATION,
  SELF_CONTACT_HIDDEN_LINK,
  toContactHiddenExplanation,
} from '../members-labels';

const HIDDEN_TITLE = 'Kontaktdaten sind hinterlegt, aber nicht freigegeben';
const PRIVATE_PLACEHOLDER = 'privat';
const PROFILE_PATH = '/profile';

interface MemberContactHiddenProps {
  firstName: string;
  isSelf?: boolean;
}

export const MemberContactHidden: FC<MemberContactHiddenProps> = ({
  firstName,
  isSelf = false,
}) => {
  const explanation = isSelf ? (
    <Stack sx={{ gap: 0.75, minWidth: 0, alignItems: 'flex-start' }}>
      <KkNote>{SELF_CONTACT_HIDDEN_EXPLANATION}</KkNote>
      <KkInlineLink component={Link} to={PROFILE_PATH}>
        {SELF_CONTACT_HIDDEN_LINK}
      </KkInlineLink>
    </Stack>
  ) : (
    <KkNote>{toContactHiddenExplanation(firstName)}</KkNote>
  );

  return (
    <KkPanel variant="block" sx={{ gap: 1.25 }}>
      <KkText variant="subtitle2" component="p">
        {HIDDEN_TITLE}
      </KkText>
      {explanation}
      <Stack sx={{ gap: 1.75, pt: 0.75, minWidth: 0 }}>
        <KkRedactedValue label="Telefon" placeholder={PRIVATE_PLACEHOLDER} width="short" />
        <KkRedactedValue label="E-Mail" placeholder={PRIVATE_PLACEHOLDER} width="medium" />
        <KkRedactedValue label="Adresse" placeholder={PRIVATE_PLACEHOLDER} width="long" />
      </Stack>
    </KkPanel>
  );
};
