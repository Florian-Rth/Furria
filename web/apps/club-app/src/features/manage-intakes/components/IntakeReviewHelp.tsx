import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { INTAKE_REVIEW_HELP_COPY, INTAKE_REVIEW_HELP_SPOTS } from '../intake-review-help-copy';
import { IntakeReviewHelpChoicePreview } from './IntakeReviewHelpChoicePreview';

export const IntakeReviewHelp: FC = () => (
  <ScreenHelp>
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_REVIEW_HELP_COPY.newcomer.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_REVIEW_HELP_COPY.newcomer.text}</KkHelp.Text>
      <ScreenHelpShow spot={INTAKE_REVIEW_HELP_SPOTS.newcomer} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Preview>
        <IntakeReviewHelpChoicePreview />
      </KkHelp.Preview>
      <KkHelp.Title>{INTAKE_REVIEW_HELP_COPY.candidates.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_REVIEW_HELP_COPY.candidates.text}</KkHelp.Text>
      <KkHelp.Text>{INTAKE_REVIEW_HELP_COPY.candidates.existing}</KkHelp.Text>
      <KkHelp.Text>{INTAKE_REVIEW_HELP_COPY.candidates.quiet}</KkHelp.Text>
      <ScreenHelpShow spot={INTAKE_REVIEW_HELP_SPOTS.candidates} />
    </KkHelp.Hint>
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_REVIEW_HELP_COPY.save.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_REVIEW_HELP_COPY.save.text}</KkHelp.Text>
    </KkHelp.Hint>
  </ScreenHelp>
);
