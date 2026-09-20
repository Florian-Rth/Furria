import type { KkConfirmFact } from '@furria/ui';
import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { formatPublishedDay } from '@/lib/announcements';
import {
  ANNOUNCEMENT_TITLE_FIELD_LABEL,
  SHEET_CANCEL_LABEL,
  SHEET_CLOSE_LABEL,
  toWithdrawQuestion,
  WITHDRAW_CONFIRM_LABEL,
  WITHDRAW_EXPLANATION,
  WITHDRAW_EYEBROW,
} from '../announcements-labels';
import type { AnnouncementWithdrawal } from '../hooks/use-announcement-withdrawal';
import type { Announcement } from '../schemas';

const AUTHOR_FACT_LABEL = 'Autor';
const PUBLISHED_FACT_LABEL = 'Ausgehängt';

const toFacts = (announcement: Announcement): KkConfirmFact[] => [
  { label: ANNOUNCEMENT_TITLE_FIELD_LABEL, value: announcement.title },
  {
    label: AUTHOR_FACT_LABEL,
    value: `${announcement.author.firstName} ${announcement.author.lastName}`,
  },
  { label: PUBLISHED_FACT_LABEL, value: formatPublishedDay(announcement.publishedAt) },
];

interface WithdrawAnnouncementDialogProps {
  withdrawal: AnnouncementWithdrawal;
}

export const WithdrawAnnouncementDialog: FC<WithdrawAnnouncementDialogProps> = ({ withdrawal }) => {
  const { pending } = withdrawal;

  if (pending === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open
      tone="danger"
      onClose={withdrawal.dismiss}
      onConfirm={withdrawal.confirm}
      eyebrow={WITHDRAW_EYEBROW}
      question={toWithdrawQuestion(pending.title)}
      explanation={WITHDRAW_EXPLANATION}
      facts={toFacts(pending)}
      error={withdrawal.rejection ?? undefined}
      confirmLabel={WITHDRAW_CONFIRM_LABEL}
      cancelLabel={SHEET_CANCEL_LABEL}
      closeLabel={SHEET_CLOSE_LABEL}
      busy={withdrawal.isWithdrawing}
    />
  );
};
