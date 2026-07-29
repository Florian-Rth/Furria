import { KkEyebrow, KkSection } from '@furria/ui';
import Typography from '@mui/material/Typography';
import { useReducedMotion } from 'motion/react';
import type { FC } from 'react';
import {
  membershipTicketIntro,
  membershipTicketKicker,
  membershipTicketObjections,
  membershipTicketRows,
  membershipTicketSectionId,
  membershipTicketStamp,
  membershipTicketStubHref,
  membershipTicketStubLabel,
  membershipTicketTitle,
} from '@/features/membership/ticket-content';
import { resolveTicketRotation } from '@/features/membership/ticket-shape';
import { MembershipTicket } from './MembershipTicket/MembershipTicket';

export const MembershipTicketSection: FC = () => {
  const reducedMotion = useReducedMotion();
  const rotation = resolveTicketRotation(reducedMotion);

  return (
    <KkSection id={membershipTicketSectionId}>
      <KkSection.Header kicker={membershipTicketKicker} title={membershipTicketTitle} />
      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', fontWeight: 500, maxWidth: '48rem' }}
      >
        {membershipTicketIntro}
      </Typography>
      <MembershipTicket
        rotation={rotation}
        sx={{ width: '100%', maxWidth: '52rem', alignSelf: 'center' }}
      >
        <MembershipTicket.Body>
          <MembershipTicket.Head>
            <KkEyebrow tone="onAccent">{membershipTicketStamp}</KkEyebrow>
            <MembershipTicket.NumberLine />
          </MembershipTicket.Head>
          <MembershipTicket.Headline />
          <MembershipTicket.Lead />
          <MembershipTicket.Rows>
            {membershipTicketRows.map((row) => (
              <MembershipTicket.Row key={row.label} row={row} />
            ))}
          </MembershipTicket.Rows>
          <MembershipTicket.Objections>
            {membershipTicketObjections.map((objection) => (
              <MembershipTicket.Objection key={objection} label={objection} />
            ))}
          </MembershipTicket.Objections>
        </MembershipTicket.Body>
        <MembershipTicket.Stub href={membershipTicketStubHref} label={membershipTicketStubLabel}>
          <MembershipTicket.StubMark />
          <MembershipTicket.StubCta />
        </MembershipTicket.Stub>
      </MembershipTicket>
    </KkSection>
  );
};
