import { KkGroupToneDot } from '@furria/ui/KkGroupToneDot';
import type { FC } from 'react';
import type { SeasonAct } from '@/features/season/schemas';

interface SeasonLineFactProps {
  act: SeasonAct;
  extra?: string | null;
}

export const SeasonLineFact: FC<SeasonLineFactProps> = ({ act, extra = null }) => {
  const dot = act.group === null ? null : <KkGroupToneDot tone={act.group.tone} />;
  const group = act.group === null ? null : <span>{act.group.name}</span>;
  const extraPart = extra === null ? null : <span>{extra}</span>;

  return (
    <>
      {dot}
      {group}
      {extraPart}
    </>
  );
};
