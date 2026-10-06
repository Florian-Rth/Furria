import { KkLead, KkSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { APPLY_THANKS_STEPS, buildApplyThanksText } from '@/features/membership/apply-content';
import type { SubmittedApplication } from '@/features/membership/hooks/use-apply-form';
import { buildJoinStepNumeral } from '@/features/membership/steps-content';
import { ApplyThanksStepRow } from './internal/layout/ApplyThanksStepRow';
import { ApplyThanksActions } from './internal/ui/ApplyThanksActions';
import { ApplyThanksStepCard } from './internal/ui/ApplyThanksStepCard';
import { ApplyThanksTitle } from './internal/ui/ApplyThanksTitle';

interface ApplyConfirmationProps {
  application: SubmittedApplication;
}

export const ApplyConfirmation: FC<ApplyConfirmationProps> = ({ application }) => {
  const thanksText = buildApplyThanksText(application.email);

  return (
    <KkSection>
      <ApplyThanksTitle firstName={application.firstName} />
      <KkLead>{thanksText}</KkLead>
      <ApplyThanksStepRow>
        {APPLY_THANKS_STEPS.map((step, index) => (
          <Grid key={step.title} size={{ xs: 12, md: 4 }}>
            <ApplyThanksStepCard numeral={buildJoinStepNumeral(index)} step={step} />
          </Grid>
        ))}
      </ApplyThanksStepRow>
      <ApplyThanksActions />
    </KkSection>
  );
};
