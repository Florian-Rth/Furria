import { KkBulletin } from '@furria/ui/KkBulletin';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  CALENDAR_ADD_ON_ICONS,
  CALENDAR_ADD_ON_LABELS,
} from '@/features/calendar/calendar-add-ons';
import { ANNOUNCEMENT_ANSWERS_LABEL, ANNOUNCEMENT_NEW_MARK_LABEL } from '../announcements-labels';

const SAMPLE_TITLE = 'Helfer für den Umzug gesucht';
const SAMPLE_META = '12.11.2026 · gültig bis 28.11.2026 · Petra Lang';
const SAMPLE_EXCERPT = 'Für den Umzug am Samstag brauchen wir noch Hände und Autos.';
const OWED_FACT = 'Antwort fehlt · bis 27.11.';
const ANSWERED_FACT = 'beantwortet';

const keep = (): void => {};

export const AnnouncementsHelpBulletinPreview: FC = () => (
  <KkBulletin mark="owed" onSelect={keep}>
    <KkBulletin.Head>
      <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
        <KkBulletin.Title>{SAMPLE_TITLE}</KkBulletin.Title>
        <KkBulletin.Meta>{SAMPLE_META}</KkBulletin.Meta>
      </Stack>
      <KkBulletin.NewMark label={ANNOUNCEMENT_NEW_MARK_LABEL} />
    </KkBulletin.Head>
    <KkBulletin.Excerpt>{SAMPLE_EXCERPT}</KkBulletin.Excerpt>
    <KkBulletin.Lines label={ANNOUNCEMENT_ANSWERS_LABEL}>
      <KkBulletin.Line
        icon={CALENDAR_ADD_ON_ICONS.signUpList}
        state="current"
        name={CALENDAR_ADD_ON_LABELS.signUpList}
        fact={OWED_FACT}
      />
      <KkBulletin.Line
        icon={CALENDAR_ADD_ON_ICONS.attendance}
        state="done"
        name={CALENDAR_ADD_ON_LABELS.attendance}
        fact={ANSWERED_FACT}
      />
    </KkBulletin.Lines>
  </KkBulletin>
);
