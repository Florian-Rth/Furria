import type { KkPassCardHeadLevel } from '@furria/ui/KkPassCard';
import { KkPassCard } from '@furria/ui/KkPassCard';
import { Link } from '@tanstack/react-router';
import type { ElementType, FC, ReactNode } from 'react';
import type { MyAct } from '@/features/acts/schemas';
import { passCardOf } from '../pass-card';
import { TEXT_LABEL, TEXT_VALUE, toActMeta } from '../pass-copy';
import { passActLinkOf } from '../pass-paths';
import { PassCardCast } from './PassCardCast';
import { PassCardPoint } from './PassCardPoint';
import { PassCardPractice } from './PassCardPractice';
import { PassCardSlot } from './PassCardSlot';
import { PassCardTraining } from './PassCardTraining';

interface PassActCardProps {
  act: MyAct;
  viewerId: number | null;
  level: KkPassCardHeadLevel;
  titleHidden?: boolean;
  linked?: boolean;
  showsGroup?: boolean;
  ownSpot?: number | null;
  action?: ReactNode;
  component?: ElementType;
}

export const PassActCard: FC<PassActCardProps> = ({
  act,
  viewerId,
  level,
  titleHidden = false,
  linked = false,
  showsGroup = true,
  ownSpot = null,
  action,
  component,
}) => {
  const card = passCardOf(act, viewerId);
  const link = passActLinkOf(act.actId);
  const groupName = showsGroup ? (act.group?.name ?? null) : null;
  const meta = toActMeta(act.kind, groupName, ownSpot);
  const linkProps = linked ? { component: Link, to: link.to, params: link.params } : {};

  const head = (
    <KkPassCard.Head
      title={act.name}
      level={level}
      titleHidden={titleHidden}
      meta={meta}
      action={action}
      {...linkProps}
    />
  );

  if (card.template === 'point') {
    return (
      <KkPassCard label={act.name} component={component}>
        {head}
        <PassCardPoint slot={card.slot} />
      </KkPassCard>
    );
  }

  const textSlot =
    card.template === 'spoken' ? (
      <KkPassCard.Fact label={TEXT_LABEL} value={TEXT_VALUE} quiet />
    ) : null;
  const training =
    card.template === 'spoken' && card.training.kind === 'none' ? null : (
      <PassCardTraining training={card.training} actName={act.name} />
    );

  return (
    <KkPassCard label={act.name} component={component}>
      {head}
      <PassCardSlot slot={card.slot} />
      {training}
      <PassCardPractice practice={card.practice} actId={act.actId} />
      {textSlot}
      <PassCardCast cast={card.cast} role={card.castRole} compact={linked} />
    </KkPassCard>
  );
};
