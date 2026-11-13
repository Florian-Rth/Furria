import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import { formatPublishedDay } from '@/lib/announcements';
import {
  ANNOUNCEMENT_TITLE_FIELD_LABEL,
  toWithdrawConsequence,
  toWithdrawExplanation,
  toWithdrawQuestion,
  WITHDRAW_CANCEL_LABEL,
  WITHDRAW_CLOSE_LABEL,
  WITHDRAW_CONFIRM_LABEL,
  WITHDRAW_EYEBROW,
} from '../announcements-labels';
import type { AnnouncementWithdrawal } from '../hooks/use-announcement-withdrawal';
import type { Announcement, AnnouncementAuthor } from '../schemas';

const AUTHOR_FACT_LABEL = 'Autor';
const PUBLISHED_FACT_LABEL = 'Veröffentlicht';

const toAuthorFacts = (author: AnnouncementAuthor | null): KkConfirmFact[] =>
  author === null
    ? []
    : [{ label: AUTHOR_FACT_LABEL, value: `${author.firstName} ${author.lastName}` }];

const toFacts = (announcement: Announcement): KkConfirmFact[] => [
  { label: ANNOUNCEMENT_TITLE_FIELD_LABEL, value: announcement.title },
  ...toAuthorFacts(announcement.author),
  { label: PUBLISHED_FACT_LABEL, value: formatPublishedDay(announcement.publishedAt) },
];

interface WithdrawAnnouncementDialogProps {
  announcement: Announcement;
  control: AnnouncementWithdrawal;
}

export const WithdrawAnnouncementDialog: FC<WithdrawAnnouncementDialogProps> = ({
  announcement,
  control,
}) => {
  const explanation = toWithdrawExplanation(announcement.answerCount);
  const facts = toFacts(announcement);
  const question = toWithdrawQuestion(announcement.title);
  const consequence = toWithdrawConsequence(announcement.title);

  return (
    <KkConfirmDialog
      open={control.isOpen}
      tone="danger"
      onClose={control.close}
      onConfirm={control.submit}
      eyebrow={WITHDRAW_EYEBROW}
      question={question}
      explanation={explanation}
      facts={facts}
      consequence={consequence}
      error={control.rejection ?? undefined}
      confirmLabel={WITHDRAW_CONFIRM_LABEL}
      cancelLabel={WITHDRAW_CANCEL_LABEL}
      closeLabel={WITHDRAW_CLOSE_LABEL}
      busy={control.isWithdrawing}
    />
  );
};
