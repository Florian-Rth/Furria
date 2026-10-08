import { SiteForm } from '@/components/SiteForm/SiteForm';
import { ApplyFormRoot } from './internal/layout/ApplyFormRoot';
import { ApplyBirthDateField } from './internal/ui/ApplyBirthDateField';
import { ApplyConsentCheckbox } from './internal/ui/ApplyConsentCheckbox';
import { ApplyConsentLabel } from './internal/ui/ApplyConsentLabel';
import { ApplyFormField } from './internal/ui/ApplyFormField';
import { ApplyHoneypotField } from './internal/ui/ApplyHoneypotField';

export const ApplyForm = Object.assign(ApplyFormRoot, {
  Columns: SiteForm.Columns,
  Main: SiteForm.Main,
  Aside: SiteForm.Aside,
  Block: SiteForm.Block,
  BlockBody: SiteForm.BlockBody,
  Legend: SiteForm.Legend,
  Fields: SiteForm.Fields,
  Field: ApplyFormField,
  BirthDate: ApplyBirthDateField,
  Note: SiteForm.Note,
  Consent: ApplyConsentCheckbox,
  ConsentLabel: ApplyConsentLabel,
  Honeypot: ApplyHoneypotField,
  Summary: SiteForm.Summary,
  SummaryRow: SiteForm.SummaryRow,
  Submit: SiteForm.Submit,
  SubmitHint: SiteForm.SubmitHint,
  Error: SiteForm.Error,
});
