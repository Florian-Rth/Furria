import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { bracketSharesOf } from '../../overview-bracket';
import { useTimeline } from '../logic/timeline-context';

interface TimelineBracketProps {
  label: string;
  valueText: string;
}

export const TimelineBracket: FC<TimelineBracketProps> = ({ label, valueText }) => {
  const { overview, length } = useTimeline();

  if (overview === null) {
    return null;
  }

  const shares = bracketSharesOf(overview.view, length);

  return (
    <KkTimeline.Bracket
      from={overview.from}
      to={overview.to}
      grip={overview.grip}
      label={label}
      valueText={valueText}
      valueNow={shares.from}
      onKey={overview.key}
    />
  );
};
