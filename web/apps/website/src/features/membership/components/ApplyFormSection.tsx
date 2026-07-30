import { KkEyebrow, KkSection } from '@furria/ui';
import type { FC } from 'react';
import {
  applyConsentLeadGuardian,
  applyConsentLeadSelf,
  applyConsentLegend,
  applyConsentNote,
  applySubmitNote,
  applySummaryEyebrow,
  applySummaryNote,
  buildApplySummaryRows,
} from '@/features/membership/apply-content';
import type { ApplyFormState } from '@/features/membership/hooks/use-apply-form';
import { ApplyAddressFieldset } from './ApplyAddressFieldset';
import { ApplyContactFieldset } from './ApplyContactFieldset';
import { ApplyForm } from './ApplyForm/ApplyForm';
import { ApplyGuardianFieldset } from './ApplyGuardianFieldset';
import { ApplyHeader } from './ApplyHeader';
import { ApplyInterestsFieldset } from './ApplyInterestsFieldset';
import { ApplyPersonFieldset } from './ApplyPersonFieldset';

interface ApplyFormSectionProps {
  state: ApplyFormState;
}

export const ApplyFormSection: FC<ApplyFormSectionProps> = ({ state }) => {
  const summaryRows = buildApplySummaryRows(state.derived);
  const consentLead = state.requiresGuardian ? applyConsentLeadGuardian : applyConsentLeadSelf;

  return (
    <KkSection>
      <ApplyHeader />
      <ApplyForm form={state.form} onSubmit={state.submit}>
        <ApplyForm.Columns>
          <ApplyForm.Main>
            <ApplyPersonFieldset />
            <ApplyAddressFieldset />
            <ApplyContactFieldset />
            <ApplyInterestsFieldset />
            {state.requiresGuardian && <ApplyGuardianFieldset />}
            <ApplyForm.Block>
              <ApplyForm.Legend>{applyConsentLegend}</ApplyForm.Legend>
              <ApplyForm.Consent>
                <ApplyForm.ConsentLabel lead={consentLead} />
              </ApplyForm.Consent>
              <ApplyForm.Note>{applyConsentNote}</ApplyForm.Note>
            </ApplyForm.Block>
            <ApplyForm.Honeypot />
          </ApplyForm.Main>
          <ApplyForm.Aside>
            <ApplyForm.Summary>
              <KkEyebrow>{applySummaryEyebrow}</KkEyebrow>
              {summaryRows.map((row) => (
                <ApplyForm.SummaryRow key={row.label} label={row.label} value={row.value} />
              ))}
              <ApplyForm.Note>{applySummaryNote}</ApplyForm.Note>
              <ApplyForm.Submit loading={state.isSubmitting} />
              <ApplyForm.Note>{applySubmitNote}</ApplyForm.Note>
            </ApplyForm.Summary>
            {state.submitError !== null && (
              <ApplyForm.Error message={state.submitError} mailHref={state.fallbackMailHref} />
            )}
          </ApplyForm.Aside>
        </ApplyForm.Columns>
      </ApplyForm>
    </KkSection>
  );
};
