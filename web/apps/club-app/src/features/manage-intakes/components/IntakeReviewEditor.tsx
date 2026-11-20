import type { KkScreenActionContext } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write/WriteScreen';
import { useIntakeReview } from '../hooks/use-intake-review';
import { RESOLVE_LABEL, REVIEW_TITLE, toIntakeOrigin } from '../intake-labels';
import type { IntakeReview, IntakeSummary } from '../schemas';
import { IntakeCandidateChoice } from './IntakeCandidateChoice';
import { IntakeNewcomerPanel } from './IntakeNewcomerPanel';

interface IntakeReviewEditorProps {
  intake: IntakeSummary;
  review: IntakeReview;
}

export const IntakeReviewEditor: FC<IntakeReviewEditorProps> = ({ intake, review }) => {
  const control = useIntakeReview(intake.intakeId, review);
  const origin = toIntakeOrigin(intake);
  const context: KkScreenActionContext | undefined =
    control.consequence === null ? undefined : { text: control.consequence, tone: 'consequence' };
  const rejection = control.rejection ?? undefined;

  return (
    <WriteScreen
      origin={origin}
      title={REVIEW_TITLE}
      rejection={rejection}
      isDirty={false}
      action={{
        context,
        primary: {
          label: RESOLVE_LABEL,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <IntakeNewcomerPanel newcomer={review.newcomer} />
      <IntakeCandidateChoice review={review} choice={control.choice} onChoose={control.choose} />
    </WriteScreen>
  );
};
