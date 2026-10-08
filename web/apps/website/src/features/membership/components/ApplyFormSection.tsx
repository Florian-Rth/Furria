import { KkEyebrow, KkSection } from '@furria/ui';
import type { FC } from 'react';
import {
  applyConsentLead,
  applyConsentLegend,
  applyConsentNote,
  applyErrorTitle,
  applySubmitDisabledHint,
  applySubmitLabel,
  applySubmitNote,
  applySummaryEyebrow,
  applySummaryNote,
  buildApplySummaryRows,
} from '@/features/membership/apply-content';
import type { ApplyFormState } from '@/features/membership/hooks/use-apply-form';
import { ApplyAddressFieldset } from './ApplyAddressFieldset';
import { ApplyContactFieldset } from './ApplyContactFieldset';
import { ApplyForm } from './ApplyForm/ApplyForm';
import { ApplyHeader } from './ApplyHeader';
import { ApplyPersonFieldset } from './ApplyPersonFieldset';
import { ApplyStandingNote } from './ApplyStandingNote';

interface ApplyFormSectionProps {
  state: ApplyFormState;
}

export const ApplyFormSection: FC<ApplyFormSectionProps> = ({ state }) => {
  const summaryRows = buildApplySummaryRows(state.derived);
  const submitError =
    state.submitError === null ? null : (
      <ApplyForm.Error
        title={applyErrorTitle}
        message={state.submitError}
        fallback={state.fallback}
      />
    );

  return (
    <KkSection>
      <ApplyHeader />
      <ApplyForm form={state.form} onSubmit={state.submit}>
        <ApplyForm.Columns>
          <ApplyForm.Main>
            <ApplyPersonFieldset today={state.today} />
            <ApplyAddressFieldset />
            <ApplyContactFieldset />
            <ApplyForm.Block>
              <ApplyForm.Legend required>{applyConsentLegend}</ApplyForm.Legend>
              <ApplyForm.BlockBody>
                <ApplyForm.Consent>
                  <ApplyForm.ConsentLabel lead={applyConsentLead} />
                </ApplyForm.Consent>
                <ApplyForm.Note>{applyConsentNote}</ApplyForm.Note>
              </ApplyForm.BlockBody>
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
              <ApplyStandingNote standing={state.standing} />
              <ApplyForm.Submit loading={state.isSubmitting}>{applySubmitLabel}</ApplyForm.Submit>
              <ApplyForm.SubmitHint>{applySubmitDisabledHint}</ApplyForm.SubmitHint>
              <ApplyForm.Note>{applySubmitNote}</ApplyForm.Note>
            </ApplyForm.Summary>
            {submitError}
          </ApplyForm.Aside>
        </ApplyForm.Columns>
      </ApplyForm>
    </KkSection>
  );
};
