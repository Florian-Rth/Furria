import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { INTAKE_HELP_COPY, INTAKE_HELP_SPOTS } from '../intake-help-copy';
import type { IntakeActions } from '../intake-rules';

interface IntakeHelpProps {
  actions: IntakeActions;
}

export const IntakeHelp: FC<IntakeHelpProps> = ({ actions }) => {
  const link = actions.showsLink ? (
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_HELP_COPY.link.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_HELP_COPY.link.text}</KkHelp.Text>
      <ScreenHelpShow spot={INTAKE_HELP_SPOTS.link} />
    </KkHelp.Hint>
  ) : null;
  const renew = actions.canRenew ? (
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_HELP_COPY.renew.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_HELP_COPY.renew.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const edit = actions.canEdit ? (
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_HELP_COPY.edit.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_HELP_COPY.edit.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const review = actions.canResolve ? (
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_HELP_COPY.review.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_HELP_COPY.review.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const discard = actions.canDiscard ? (
    <KkHelp.Hint>
      <KkHelp.Title>{INTAKE_HELP_COPY.discard.title}</KkHelp.Title>
      <KkHelp.Text>{INTAKE_HELP_COPY.discard.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      {link}
      {review}
      {renew}
      {edit}
      <KkHelp.Hint>
        <KkHelp.Title>{INTAKE_HELP_COPY.decision.title}</KkHelp.Title>
        <KkHelp.Text>{INTAKE_HELP_COPY.decision.text}</KkHelp.Text>
        <KkHelp.Text>{INTAKE_HELP_COPY.decision.done}</KkHelp.Text>
        <ScreenHelpShow spot={INTAKE_HELP_SPOTS.decision} />
      </KkHelp.Hint>
      {discard}
    </ScreenHelp>
  );
};
