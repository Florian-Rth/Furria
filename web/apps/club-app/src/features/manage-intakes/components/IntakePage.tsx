import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { parsePositiveId } from '@/lib/positive-id';
import { useIntakePage } from '../hooks/use-intake-page';
import { INTAKE_EYEBROW, INTAKES_ORIGIN, toIntakeName } from '../intake-labels';
import { IntakeHeader } from './IntakeHeader';
import { IntakeHold } from './IntakeHold';
import { IntakeView } from './IntakeView';

const ROUTE_ID = '/_app/manage/intakes_/$intakeId';

export const IntakePage: FC = () => {
  const { intakeId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(intakeId);
  const page = useIntakePage(id);
  const details = page.intake.data;
  const hasFailed = id === null || page.intake.error !== null;
  const title = details === undefined ? INTAKE_EYEBROW : toIntakeName(details.intake);
  const pendingHeader = hasFailed ? null : <KkScreenHeaderSkeleton />;
  const header = details === undefined ? pendingHeader : <IntakeHeader intake={details.intake} />;
  const body =
    details === undefined || page.actions === null ? (
      <IntakeHold intakeId={id} />
    ) : (
      <IntakeView
        details={details}
        actions={page.actions}
        share={page.share}
        renewal={page.renewal}
      />
    );

  return (
    <KkScreen
      kind="detail"
      title={title}
      origin={INTAKES_ORIGIN}
      header={header}
      action={page.actionBar}
      actions={page.headerActions}
      handover={AREA_HANDOVERS.manage}
    >
      {body}
    </KkScreen>
  );
};
