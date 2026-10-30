import { KkPassCard } from '@furria/ui/KkPassCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { PassPractice } from '../pass-act';
import { PRACTICE_LABEL, toSilentPracticeHint } from '../pass-copy';
import { playerLinkOf } from '../pass-paths';

interface PassCardPracticeProps {
  practice: PassPractice;
  actId: number;
}

export const PassCardPractice: FC<PassCardPracticeProps> = ({ practice, actId }) => {
  if (practice.kind === 'hidden') {
    return null;
  }
  if (practice.kind === 'silent') {
    return (
      <KkPassCard.Practice
        label={PRACTICE_LABEL}
        disabled
        hint={toSilentPracticeHint(practice.askNames)}
      />
    );
  }

  const link = playerLinkOf(actId);

  return (
    <KkPassCard.Practice
      label={PRACTICE_LABEL}
      component={Link}
      to={link.to}
      params={link.params}
    />
  );
};
