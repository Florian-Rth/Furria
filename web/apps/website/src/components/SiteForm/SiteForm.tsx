import { SummaryRow } from '@/components/SummaryRow';
import { SiteFormAside } from './internal/layout/SiteFormAside';
import { SiteFormBlock } from './internal/layout/SiteFormBlock';
import { SiteFormBlockBody } from './internal/layout/SiteFormBlockBody';
import { SiteFormColumns } from './internal/layout/SiteFormColumns';
import { SiteFormFields } from './internal/layout/SiteFormFields';
import { SiteFormMain } from './internal/layout/SiteFormMain';
import { SiteFormRoot } from './internal/layout/SiteFormRoot';
import { SiteFormSummary } from './internal/layout/SiteFormSummary';
import { SiteFormConsent } from './internal/ui/SiteFormConsent';
import { SiteFormError } from './internal/ui/SiteFormError';
import { SiteFormHoneypot } from './internal/ui/SiteFormHoneypot';
import { SiteFormLegend } from './internal/ui/SiteFormLegend';
import { SiteFormNote } from './internal/ui/SiteFormNote';
import { SiteFormSubmit } from './internal/ui/SiteFormSubmit';
import { SiteFormSubmitHint } from './internal/ui/SiteFormSubmitHint';
import { SiteFormTextField } from './internal/ui/SiteFormTextField';

export const SiteForm = Object.assign(SiteFormRoot, {
  Columns: SiteFormColumns,
  Main: SiteFormMain,
  Aside: SiteFormAside,
  Block: SiteFormBlock,
  BlockBody: SiteFormBlockBody,
  Legend: SiteFormLegend,
  Fields: SiteFormFields,
  TextField: SiteFormTextField,
  Consent: SiteFormConsent,
  Honeypot: SiteFormHoneypot,
  Note: SiteFormNote,
  Summary: SiteFormSummary,
  SummaryRow,
  Submit: SiteFormSubmit,
  SubmitHint: SiteFormSubmitHint,
  Error: SiteFormError,
});
