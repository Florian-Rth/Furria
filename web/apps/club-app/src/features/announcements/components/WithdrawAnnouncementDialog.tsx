import type { KkConfirmFact } from '@furria/ui';
import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { formatPublishedDay } from '@/lib/announcements';
import {
  ANNOUNCEMENT_TITLE_FIELD_LABEL,
  toWithdrawConsequence,
  toWithdrawQuestion,
  WITHDRAW_CANCEL_LABEL,
  WITHDRAW_CLOSE_LABEL,
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
  announcement: Announcement;
  control: AnnouncementWithdrawal;
}

export const WithdrawAnnouncementDialog: FC<WithdrawAnnouncementDialogProps> = ({
  announcement,
  control,
}) => (
  <KkConfirmDialog
    open={control.isOpen}
    tone="danger"
    onClose={control.close}
    onConfirm={control.submit}
    eyebrow={WITHDRAW_EYEBROW}
    question={toWithdrawQuestion(announcement.title)}
    explanation={WITHDRAW_EXPLANATION}
    facts={toFacts(announcement)}
    consequence={toWithdrawConsequence(announcement.title)}
    error={control.rejection ?? undefined}
    confirmLabel={WITHDRAW_CONFIRM_LABEL}
    cancelLabel={WITHDRAW_CANCEL_LABEL}
    closeLabel={WITHDRAW_CLOSE_LABEL}
    busy={control.isWithdrawing}
  />
);
