import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { ENTRY_HELP_COPY, ENTRY_HELP_SPOTS } from '../calendar-entry-help-copy';
import type { EntryHelpViewer } from '../hooks/use-entry-help-viewer';
import { EntryHelpAddOnsPreview } from './EntryHelpAddOnsPreview';
import { EntryHelpAudiencePreview } from './EntryHelpAudiencePreview';
import { EntryHelpKindPreview } from './EntryHelpKindPreview';
import { EntryHelpNotifyPreview } from './EntryHelpNotifyPreview';

interface CalendarEntryHelpProps {
  viewer: EntryHelpViewer;
}

export const CalendarEntryHelp: FC<CalendarEntryHelpProps> = ({ viewer }) => {
  const whatsApp = viewer.reachesClubGroup ? (
    <KkHelp.Text>{ENTRY_HELP_COPY.notify.whatsApp}</KkHelp.Text>
  ) : null;
  const notify = viewer.notifies ? (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <EntryHelpNotifyPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{ENTRY_HELP_COPY.notify.title}</KkHelp.Title>
      <KkHelp.Text>{ENTRY_HELP_COPY.notify.text}</KkHelp.Text>
      {whatsApp}
      <KkHelp.Text>{ENTRY_HELP_COPY.notify.quiet}</KkHelp.Text>
      <ScreenHelpShow spot={ENTRY_HELP_SPOTS.audience} />
    </KkHelp.Hint>
  ) : null;
  const saving = viewer.isEditing ? ENTRY_HELP_COPY.save.edit : ENTRY_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <EntryHelpKindPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{ENTRY_HELP_COPY.basics.title}</KkHelp.Title>
        <KkHelp.Text>{ENTRY_HELP_COPY.basics.text}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.basics.training}</KkHelp.Text>
        <ScreenHelpShow spot={ENTRY_HELP_SPOTS.basics} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <EntryHelpAudiencePreview />
        </KkHelp.Preview>
        <KkHelp.Title>{ENTRY_HELP_COPY.audience.title}</KkHelp.Title>
        <KkHelp.Text>{ENTRY_HELP_COPY.audience.text}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.audience.people}</KkHelp.Text>
        <ScreenHelpShow spot={ENTRY_HELP_SPOTS.audience} />
      </KkHelp.Hint>
      {notify}
      <KkHelp.Hint>
        <KkHelp.Title>{ENTRY_HELP_COPY.schedule.title}</KkHelp.Title>
        <KkHelp.Text>{ENTRY_HELP_COPY.schedule.text}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.schedule.venue}</KkHelp.Text>
        <ScreenHelpShow spot={ENTRY_HELP_SPOTS.schedule} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ENTRY_HELP_COPY.description.title}</KkHelp.Title>
        <KkHelp.Text>{ENTRY_HELP_COPY.description.text}</KkHelp.Text>
        <ScreenHelpShow spot={ENTRY_HELP_SPOTS.description} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <EntryHelpAddOnsPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{ENTRY_HELP_COPY.addOns.title}</KkHelp.Title>
        <KkHelp.Text>{ENTRY_HELP_COPY.addOns.text}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.addOns.attendance}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.addOns.poll}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.addOns.signUpList}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.addOns.participatingGroups}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.addOns.daySchedule}</KkHelp.Text>
        <ScreenHelpShow spot={ENTRY_HELP_SPOTS.addOns} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{ENTRY_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{ENTRY_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
