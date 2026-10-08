import { SiteForm } from '@/components/SiteForm/SiteForm';
import { TicketRequestFormRoot } from './internal/layout/TicketRequestFormRoot';
import { TicketCountField } from './internal/ui/TicketCountField';
import { TicketRequestConsent } from './internal/ui/TicketRequestConsent';
import { TicketRequestConsentLabel } from './internal/ui/TicketRequestConsentLabel';
import { TicketRequestField } from './internal/ui/TicketRequestField';
import { TicketRequestHoneypot } from './internal/ui/TicketRequestHoneypot';

export const TicketRequestFormKit = Object.assign(TicketRequestFormRoot, {
  Columns: SiteForm.Columns,
  Main: SiteForm.Main,
  Aside: SiteForm.Aside,
  Block: SiteForm.Block,
  BlockBody: SiteForm.BlockBody,
  Legend: SiteForm.Legend,
  Fields: SiteForm.Fields,
  Field: TicketRequestField,
  Count: TicketCountField,
  Note: SiteForm.Note,
  Consent: TicketRequestConsent,
  ConsentLabel: TicketRequestConsentLabel,
  Honeypot: TicketRequestHoneypot,
  Summary: SiteForm.Summary,
  SummaryRow: SiteForm.SummaryRow,
  Submit: SiteForm.Submit,
  SubmitHint: SiteForm.SubmitHint,
  Error: SiteForm.Error,
});
