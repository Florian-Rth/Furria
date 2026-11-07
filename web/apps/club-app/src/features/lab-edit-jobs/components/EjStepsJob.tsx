import type { StudioScreen } from '@furria/studio/studio-screen';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { StepListPanel } from '@/features/lab-step-setup/components/StepListPanel';

interface EjStepsJobProps {
  screen: StudioScreen;
}

const ROUTE_ID = '/_app/lab_/edit-jobs/$actId';

export const EjStepsJob: FC<EjStepsJobProps> = ({ screen }) => {
  const { actId } = useParams({ from: ROUTE_ID });
  const id = Number(actId);

  return <StepListPanel screen={screen} actId={id} />;
};
