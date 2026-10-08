import { KkInlineLink, KkText } from '@furria/ui';
import type { FC } from 'react';
import type { TicketRequest } from '../schemas';
import { toMailHref, toPhoneHref, toQuotedMessage } from '../ticket-requests-labels';

const CONTACT_SEPARATOR = ' · ';

interface TicketRequestContactProps {
  request: TicketRequest;
}

export const TicketRequestContact: FC<TicketRequestContactProps> = ({ request }) => {
  const phoneHref = toPhoneHref(request.phone);
  const mailHref = toMailHref(request.email);

  const message =
    request.message === null ? null : (
      <KkText variant="body2" tone="secondary">
        {toQuotedMessage(request.message)}
      </KkText>
    );

  return (
    <>
      <KkText variant="body2">
        <KkInlineLink href={phoneHref}>{request.phone}</KkInlineLink>
        {CONTACT_SEPARATOR}
        <KkInlineLink href={mailHref}>{request.email}</KkInlineLink>
      </KkText>
      {message}
    </>
  );
};
