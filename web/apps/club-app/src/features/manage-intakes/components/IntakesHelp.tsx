import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { INTAKES_HELP_COPY, INTAKES_HELP_SPOTS } from '../intakes-help-copy';
import { IntakesHelpRowPreview } from './IntakesHelpRowPreview';

interface IntakesHelpProps {
  managesPersons: boolean;
}

export const IntakesHelp: FC<IntakesHelpProps> = ({ managesPersons }) => {
  const groupAdmin = managesPersons ? null : (
    <KkHelp.Hint>
      <KkHelp.Title chip={INTAKES_HELP_COPY.groupAdmin.chip}>
        {INTAKES_HELP_COPY.groupAdmin.title}
      </KkHelp.Title>
      <KkHelp.Text>{INTAKES_HELP_COPY.groupAdmin.text}</KkHelp.Text>
    </KkHelp.Hint>
  );

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{INTAKES_HELP_COPY.what.title}</KkHelp.Title>
        <KkHelp.Text>{INTAKES_HELP_COPY.what.text}</KkHelp.Text>
        <KkHelp.Text>{INTAKES_HELP_COPY.what.create}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <IntakesHelpRowPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{INTAKES_HELP_COPY.list.title}</KkHelp.Title>
        <KkHelp.Text>{INTAKES_HELP_COPY.list.text}</KkHelp.Text>
        <KkHelp.Text>{INTAKES_HELP_COPY.list.review}</KkHelp.Text>
        <ScreenHelpShow spot={INTAKES_HELP_SPOTS.list} />
      </KkHelp.Hint>
      {groupAdmin}
    </ScreenHelp>
  );
};
