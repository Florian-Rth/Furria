import type { AppSection } from '@/features/session/app-sections';
import { INTAKES_PATH, INTAKES_TITLE } from '../intake-labels';
import { runsIntakes } from '../intake-rules';
import { useIntakeRights } from './use-intake-rights';

const INTAKES_SECTION: AppSection = {
  id: 'intakes',
  label: INTAKES_TITLE,
  icon: 'qr',
  to: INTAKES_PATH,
};

const NO_SECTIONS: readonly AppSection[] = [];
const ONLY_INTAKES: readonly AppSection[] = [INTAKES_SECTION];

export const useIntakesSection = (): readonly AppSection[] => {
  const { rights } = useIntakeRights();
  const reachesThroughManageHub = rights.managesPersons;

  return runsIntakes(rights) && !reachesThroughManageHub ? ONLY_INTAKES : NO_SECTIONS;
};
