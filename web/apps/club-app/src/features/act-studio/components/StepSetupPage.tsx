import { SETUP_DENIED, STEP_SETUP_TITLE } from '@furria/studio/step-setup-copy';
import type { FC } from 'react';
import type { ActPageSearch } from '@/features/acts/schemas';
import { useStepSetupPage } from '../hooks/use-step-setup-page';
import { useStudioVisit } from '../hooks/use-studio-visit';
import { ActStudioPageGate } from './ActStudioPageGate';
import { StepSetupBody } from './StepSetupBody';

interface StepSetupPageProps {
  actId: string;
  search: ActPageSearch;
}

export const StepSetupPage: FC<StepSetupPageProps> = ({ actId, search }) => {
  const page = useStepSetupPage(actId, search);
  useStudioVisit(page.actId);
  const studio = page.query.data?.studio ?? null;
  const body =
    page.actId === null || studio === null ? null : (
      <StepSetupBody page={page} actId={page.actId} studio={studio} />
    );

  return (
    <ActStudioPageGate
      page={page}
      title={page.actName}
      heading={null}
      deniedTitle={STEP_SETUP_TITLE}
      deniedMessage={SETUP_DENIED}
    >
      {body}
    </ActStudioPageGate>
  );
};
