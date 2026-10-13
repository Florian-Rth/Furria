import {
  aspectRatioCss,
  KkAnswerChoice,
  KkMeta,
  KkPanelSection,
  KkPhoto,
  KkSheet,
  KkText,
} from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import type { EntrySheetView } from '../types';
import { EntryGroupsSection } from './EntryGroupsSection';
import { EntryVenueSection } from './EntryVenueSection';

const CLOSE_LABEL = 'Schließen';
const ANSWER_TITLE = 'Deine Antwort';
const PRE_LINE = { whiteSpace: 'pre-line' } as const;
const COVER_ASPECT_RATIO = aspectRatioCss('banner');

interface EntrySheetBodyProps {
  sheet: EntrySheetView;
}

export const EntrySheetBody: FC<EntrySheetBodyProps> = ({ sheet }) => {
  const { answer, cover } = sheet;

  const opener =
    cover === null ? null : (
      <KkPhoto
        alt=""
        image={cover.image}
        aspectRatio={COVER_ASPECT_RATIO}
        tone={cover.tone}
        stampLabel={cover.cancelledLabel}
      />
    );

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

  const details = sheet.details === null ? null : <KkMeta>{sheet.details}</KkMeta>;

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
        {opener}
        <Stack sx={{ gap: 0.5, minWidth: 0 }}>
          <KkMeta>{sheet.headline}</KkMeta>
          {running}
        </Stack>
        {description}
        {details}
        {venue}
        <EntryGroupsSection owner={sheet.owner} participating={sheet.participating} />
        {runs}
        {choice}
      </KkSheet.Body>
      <KkSheet.Actions primary={sheet.primary} secondary={sheet.secondary} />
    </KkSheet>
  );
};
