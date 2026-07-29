import { MembershipTicketBody } from './internal/layout/MembershipTicketBody';
import { MembershipTicketHead } from './internal/layout/MembershipTicketHead';
import { MembershipTicketObjectionRow } from './internal/layout/MembershipTicketObjectionRow';
import { MembershipTicketRoot } from './internal/layout/MembershipTicketRoot';
import { MembershipTicketRowList } from './internal/layout/MembershipTicketRowList';
import { MembershipTicketStub } from './internal/layout/MembershipTicketStub';
import { MembershipTicketHeadline } from './internal/ui/MembershipTicketHeadline';
import { MembershipTicketLead } from './internal/ui/MembershipTicketLead';
import { MembershipTicketNumberLine } from './internal/ui/MembershipTicketNumberLine';
import { MembershipTicketObjection } from './internal/ui/MembershipTicketObjection';
import { MembershipTicketRow } from './internal/ui/MembershipTicketRow';
import { MembershipTicketStubCta } from './internal/ui/MembershipTicketStubCta';
import { MembershipTicketStubMark } from './internal/ui/MembershipTicketStubMark';

export const MembershipTicket = Object.assign(MembershipTicketRoot, {
  Body: MembershipTicketBody,
  Head: MembershipTicketHead,
  NumberLine: MembershipTicketNumberLine,
  Headline: MembershipTicketHeadline,
  Lead: MembershipTicketLead,
  Rows: MembershipTicketRowList,
  Row: MembershipTicketRow,
  Objections: MembershipTicketObjectionRow,
  Objection: MembershipTicketObjection,
  Stub: MembershipTicketStub,
  StubMark: MembershipTicketStubMark,
  StubCta: MembershipTicketStubCta,
});
