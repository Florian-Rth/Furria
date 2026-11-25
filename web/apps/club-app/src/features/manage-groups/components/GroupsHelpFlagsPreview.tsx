import type { FC } from 'react';
import type { GroupRegisterFlag } from '../manage-groups-labels';
import { GroupRegisterFlags } from './GroupRegisterFlags';

const SAMPLE_FLAGS: readonly GroupRegisterFlag[] = [
  { id: 'no-people', label: 'Niemand dabei', tone: 'gold', dot: true },
  { id: 'kind', label: 'Showtanz', tone: 'neutral', dot: false },
];

export const GroupsHelpFlagsPreview: FC = () => <GroupRegisterFlags flags={SAMPLE_FLAGS} />;
