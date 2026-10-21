import { KkTenureChainRow } from '@furria/ui';
import type { FC } from 'react';
import { formatPeriod } from '@/lib/membership-labels';
import { toPersonName } from '../manage-roles-labels';
import { HOLDING_ENDED_LABEL } from '../roles-hub-copy';
import type { RoleHolder } from '../schemas';

interface RolePastRowProps {
  holder: RoleHolder;
}

export const RolePastRow: FC<RolePastRowProps> = ({ holder }) => {
  const name = toPersonName(holder);
  const span = formatPeriod(holder.sinceOn, holder.untilOn);

  return <KkTenureChainRow name={name} span={span} state="past" stateLabel={HOLDING_ENDED_LABEL} />;
};
