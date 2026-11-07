import { useNavigate, useSearch } from '@tanstack/react-router';
import { originSearchOf } from '@/features/act-card/act-card-paths';
import { actScreenPathOf } from '@/features/acts/act-screens';
import { ActScreenSearchSchema } from '@/features/acts/schemas';

export const useStepSetupRoute = (actId: number): (() => void) => {
  const navigate = useNavigate();
  const search = ActScreenSearchSchema.parse(useSearch({ strict: false }));

  return () => {
    void navigate({
      to: actScreenPathOf(actId, { kind: 'stepSetup' }),
      search: originSearchOf(search),
    });
  };
};
