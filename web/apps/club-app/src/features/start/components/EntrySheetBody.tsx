import { KkAnswerChoice, KkMeta, KkPanelSection, KkSheet, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { useEntrySheet } from '../hooks/use-entry-sheet';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartEntry } from '../schemas';
import { EntryGroupsSection } from './EntryGroupsSection';
import { EntryVenueSection } from './EntryVenueSection';

const CLOSE_LABEL = 'Schließen';
const ANSWER_TITLE = 'Deine Antwort';
const PRE_LINE = { whiteSpace: 'pre-line' } as const;

interface EntrySheetBodyProps {
  entry: StartEntry;
  board: StartBoard;
}

export const EntrySheetBody: FC<EntrySheetBodyProps> = ({ entry, board }) => {
  const sheet = useEntrySheet(entry, board);
  const { answer } = sheet;

  const running =
    sheet.runningNote === null ? null : <KkMeta tone="accent">{sheet.runningNote}</KkMeta>;

  const venue = sheet.venue === null ? null : <EntryVenueSection venue={sheet.venue} />;

  const runs = sheet.runsLine === null ? null : <KkText variant="body2">{sheet.runsLine}</KkText>;

  const description =
    sheet.description === null ? null : (
      <KkText variant="body2" tone="secondary" sx={PRE_LINE}>
        {sheet.description}
      </KkText>
    );

  const choice =
    answer === null ? null : (
      <KkPanelSection title={ANSWER_TITLE}>
        <KkAnswerChoice
          label={answer.label}
          value={answer.value}
          onChange={answer.choose}
          labels={ATTENDANCE_LABELS}
          error={answer.error}
          disabled={answer.disabled}
        />
      </KkPanelSection>
    );

  return (
    <KkSheet id={sheet.sheetId} title={sheet.title} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <Stack sx={{ gap: 0.5, minWidth: 0 }}>
          <KkMeta>{sheet.headline}</KkMeta>
          {running}
        </Stack>
        {description}
        {venue}
        <EntryGroupsSection owner={sheet.owner} participating={sheet.participating} />
        {runs}
        {choice}
      </KkSheet.Body>
      <KkSheet.Actions primary={sheet.onward} />
    </KkSheet>
  );
};
