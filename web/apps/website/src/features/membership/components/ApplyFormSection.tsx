import { KkEyebrow, KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import {
  applyAddressLegend,
  applyAddressNote,
  applyConsentLeadGuardian,
  applyConsentLeadSelf,
  applyConsentLegend,
  applyConsentNote,
  applyContactLegend,
  applyContactNote,
  applyFieldLabels,
  applyPersonLegend,
  applySubmitNote,
  applySummaryEyebrow,
  applySummaryNote,
  buildApplySummaryRows,
} from '@/features/membership/apply-content';
import { buildFallbackMailHref } from '@/features/membership/apply-fallback';
import { selectGroupLabels } from '@/features/membership/group-interests';
import type { ApplyFormState } from '@/features/membership/hooks/use-apply-form';
import { selectLoadedGroups, useGroupsSource } from '@/features/membership/hooks/use-groups-source';
import { ApplyForm } from './ApplyForm/ApplyForm';
import { ApplyGuardianFieldset } from './ApplyGuardianFieldset';
import { ApplyHeader } from './ApplyHeader';
import { ApplyInterestsFieldset } from './ApplyInterestsFieldset';

interface ApplyFormSectionProps {
  state: ApplyFormState;
}

export const ApplyFormSection: FC<ApplyFormSectionProps> = ({ state }) => {
  const groupsSource = useGroupsSource();
  const summaryRows = buildApplySummaryRows(state.derived);
  const consentLead = state.requiresGuardian ? applyConsentLeadGuardian : applyConsentLeadSelf;
  const values = state.form.getValues();
  const fallbackMailHref =
    state.submitError === null
      ? ''
      : buildFallbackMailHref(
          values,
          selectGroupLabels(selectLoadedGroups(groupsSource), values.groupInterests),
        );

  return (
    <KkSection>
      <ApplyHeader />
      <ApplyForm form={state.form} onSubmit={state.submit}>
        <ApplyForm.Columns>
          <ApplyForm.Main>
            <ApplyForm.Block>
              <ApplyForm.Legend>{applyPersonLegend}</ApplyForm.Legend>
              <ApplyForm.Fields>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ApplyForm.Field
                    name="firstName"
                    label={applyFieldLabels.firstName}
                    required
                    autoComplete="given-name"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ApplyForm.Field
                    name="lastName"
                    label={applyFieldLabels.lastName}
                    required
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ApplyForm.Field
                    name="birthDate"
                    label={applyFieldLabels.birthDate}
                    type="date"
                    required
                    autoComplete="bday"
                  />
                </Grid>
              </ApplyForm.Fields>
            </ApplyForm.Block>
            <ApplyForm.Block>
              <ApplyForm.Legend>{applyAddressLegend}</ApplyForm.Legend>
              <ApplyForm.Fields>
                <Grid size={12}>
                  <ApplyForm.Field
                    name="street"
                    label={applyFieldLabels.street}
                    required
                    autoComplete="street-address"
                  />
                </Grid>
                <Grid size={{ xs: 5, sm: 4 }}>
                  <ApplyForm.Field
                    name="postalCode"
                    label={applyFieldLabels.postalCode}
                    required
                    autoComplete="postal-code"
                  />
                </Grid>
                <Grid size={{ xs: 7, sm: 8 }}>
                  <ApplyForm.Field
                    name="city"
                    label={applyFieldLabels.city}
                    required
                    autoComplete="address-level2"
                  />
                </Grid>
              </ApplyForm.Fields>
              <ApplyForm.Note>{applyAddressNote}</ApplyForm.Note>
            </ApplyForm.Block>
            <ApplyForm.Block>
              <ApplyForm.Legend>{applyContactLegend}</ApplyForm.Legend>
              <ApplyForm.Fields>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <ApplyForm.Field
                    name="email"
                    label={applyFieldLabels.email}
                    type="email"
                    required
                    autoComplete="email"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <ApplyForm.Field
                    name="phone"
                    label={applyFieldLabels.phone}
                    type="tel"
                    required={false}
                    autoComplete="tel"
                  />
                </Grid>
              </ApplyForm.Fields>
              <ApplyForm.Note>{applyContactNote}</ApplyForm.Note>
            </ApplyForm.Block>
            <ApplyInterestsFieldset source={groupsSource} />
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
              <ApplyForm.Error message={state.submitError} mailHref={fallbackMailHref} />
            )}
          </ApplyForm.Aside>
        </ApplyForm.Columns>
      </ApplyForm>
    </KkSection>
  );
};
