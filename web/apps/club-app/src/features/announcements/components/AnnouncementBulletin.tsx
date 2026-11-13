import { KkBulletin } from '@furria/ui/KkBulletin';
import { MENTION_KINDS, plainTextOf } from '@furria/ui/rich-text';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toPeekId } from '@/lib/peek';
import type { AnnouncementAddOnMark } from '../announcement-add-ons';
import type { BulletinAnnouncement, BulletinSize } from '../announcement-bulletin';
import { toBulletinMark, toBulletinMarkItems } from '../announcement-bulletin';
import { ANNOUNCEMENT_NEW_MARK_LABEL, toAnnouncementMetaLabel } from '../announcements-labels';
import { AnnouncementAnswerLines } from './AnnouncementAnswerLines';

const EXCERPT_LINES: Record<BulletinSize, number> = { regular: 2, compact: 1 };

interface AnnouncementBulletinProps {
  announcement: BulletinAnnouncement;
  marks: readonly AnnouncementAddOnMark[];
  size: BulletinSize;
  isNew: boolean;
  isExpired?: boolean;
  highlight?: boolean;
  landing?: string;
}

export const AnnouncementBulletin: FC<AnnouncementBulletinProps> = ({
  announcement,
  marks,
  size,
  isNew,
  isExpired = false,
  highlight = false,
  landing,
}) => {
  const sheet = useKkSheetCommands();
  const isCompact = size === 'compact';
  const meta = toAnnouncementMetaLabel(
    announcement.publishedAt,
    announcement.validUntil,
    announcement.author,
  );
  const mark = toBulletinMark(marks, isNew, isExpired);
  const newMark =
    isNew && !isExpired ? <KkBulletin.NewMark label={ANNOUNCEMENT_NEW_MARK_LABEL} /> : null;
  const compactMarks = isCompact ? <KkBulletin.Marks marks={toBulletinMarkItems(marks)} /> : null;
  const excerptText = plainTextOf(announcement.body, MENTION_KINDS);
  const excerpt = isCompact ? null : (
    <KkBulletin.Excerpt lines={EXCERPT_LINES[size]}>{excerptText}</KkBulletin.Excerpt>
  );
  const answers = isCompact ? null : <AnnouncementAnswerLines marks={marks} />;
  const openAnnouncement = (): void => {
    sheet.open(toPeekId('announcement', announcement.announcementId));
  };

  return (
    <KkBulletin
      mark={mark}
      dimmed={isExpired}
      highlight={highlight}
      landing={landing}
      onSelect={openAnnouncement}
    >
      <KkBulletin.Head>
        <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
          <KkBulletin.Title size={size}>{announcement.title}</KkBulletin.Title>
          <KkBulletin.Meta>{meta}</KkBulletin.Meta>
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {newMark}
          {compactMarks}
        </Stack>
      </KkBulletin.Head>
      {excerpt}
      {answers}
    </KkBulletin>
  );
};
