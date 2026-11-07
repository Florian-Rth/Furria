import { useNavigate } from '@tanstack/react-router';

export const useStepSetupRoute = (actId: number): (() => void) => {
  const navigate = useNavigate();

  return () => {
    void navigate({
      from: '/acts/$actId',
      to: '/acts/$actId/steps/setup',
      params: { actId: String(actId) },
      search: (previous) => previous,
    });
  };
};
