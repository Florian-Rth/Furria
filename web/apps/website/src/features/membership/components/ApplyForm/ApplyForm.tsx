import { ApplyFormAside } from './internal/layout/ApplyFormAside';
import { ApplyFormBlock } from './internal/layout/ApplyFormBlock';
import { ApplyFormBlockBody } from './internal/layout/ApplyFormBlockBody';
import { ApplyFormColumns } from './internal/layout/ApplyFormColumns';
import { ApplyFormFields } from './internal/layout/ApplyFormFields';
import { ApplyFormMain } from './internal/layout/ApplyFormMain';
import { ApplyFormRoot } from './internal/layout/ApplyFormRoot';
import { ApplySummaryPanel } from './internal/layout/ApplySummaryPanel';
import { ApplyBirthDateField } from './internal/ui/ApplyBirthDateField';
import { ApplyConsentCheckbox } from './internal/ui/ApplyConsentCheckbox';
import { ApplyConsentLabel } from './internal/ui/ApplyConsentLabel';
import { ApplyErrorFallback } from './internal/ui/ApplyErrorFallback';
import { ApplyFormField } from './internal/ui/ApplyFormField';
import { ApplyFormLegend } from './internal/ui/ApplyFormLegend';
import { ApplyFormNote } from './internal/ui/ApplyFormNote';
import { ApplyFormStatus } from './internal/ui/ApplyFormStatus';
import { ApplyHoneypotField } from './internal/ui/ApplyHoneypotField';
import { ApplyInterestChoices } from './internal/ui/ApplyInterestChoices';
import { ApplySubmitButton } from './internal/ui/ApplySubmitButton';
import { ApplySubmitHint } from './internal/ui/ApplySubmitHint';
import { ApplySummaryRow } from './internal/ui/ApplySummaryRow';

export const ApplyForm = Object.assign(ApplyFormRoot, {
  Columns: ApplyFormColumns,
  Main: ApplyFormMain,
  Aside: ApplyFormAside,
  Block: ApplyFormBlock,
  BlockBody: ApplyFormBlockBody,
  Legend: ApplyFormLegend,
  Fields: ApplyFormFields,
  Field: ApplyFormField,
  BirthDate: ApplyBirthDateField,
  Note: ApplyFormNote,
  Status: ApplyFormStatus,
  Interests: ApplyInterestChoices,
  Consent: ApplyConsentCheckbox,
  ConsentLabel: ApplyConsentLabel,
  Honeypot: ApplyHoneypotField,
  Summary: ApplySummaryPanel,
  SummaryRow: ApplySummaryRow,
  Submit: ApplySubmitButton,
  SubmitHint: ApplySubmitHint,
  Error: ApplyErrorFallback,
});
