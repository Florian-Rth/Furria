import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { useIntakeSubScreen } from '../hooks/use-intake-sub-screen';
import { REVIEW_TITLE } from '../intake-labels';
import { IntakeReviewEditor } from './IntakeReviewEditor';
import { IntakeSubScreenHold } from './IntakeSubScreenHold';

const ROUTE_ID = '/_app/manage/persons_/intakes_/$intakeId_/review';

export const IntakeReviewScreen: FC = () => {
  const { intakeId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(intakeId);
  const screen = useIntakeSubScreen(id, 'resolve');
  const review = screen.details?.review ?? null;

  if (screen.details === null || review === null) {
    return <IntakeSubScreenHold title={REVIEW_TITLE} intakeId={id} gate={screen.gate} />;
  }

  return <IntakeReviewEditor intake={screen.details.intake} review={review} />;
};
