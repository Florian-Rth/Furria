import { KkFacetTile } from '@furria/ui/KkFacetTile';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import {
  NO_EVENING,
  NO_MUSIC,
  NO_TRAINING,
  PRACTICE_READY,
  toAnswerLine,
  toAskLine,
  toClockLine,
  toDayLine,
  toDoorLabel,
  toHubActMeta,
  toOpenActHint,
  toSlotLine,
} from '../act-card-copy';
import { askOf } from '../act-card-model';
import { actCardLinkOf } from '../act-card-paths';
import type { HubActCard, HubCellTone } from '../hub-acts';

const EVENING_LABEL = toDoorLabel('evening', 'studio', null);
const TRAINING_LABEL = toDoorLabel('training', 'studio', null);
const PRACTICE_LABEL = toDoorLabel('practice', 'studio', null);

const optionalLine = (text: string, tone: HubCellTone = 'secondary'): ReactNode =>
  text === '' ? null : <KkFacetTile.Line tone={tone}>{text}</KkFacetTile.Line>;

interface ActCardHubActTileProps {
  card: HubActCard;
  groupId: number;
  viewerId: number | null;
  order: number;
}

export const ActCardHubActTile: FC<ActCardHubActTileProps> = ({
  card,
  groupId,
  viewerId,
  order,
}) => {
  const { act, band } = card;
  const link = actCardLinkOf(act.actId, groupId);
  const meta = toHubActMeta(act.kind, act.cast.length);
  const hint = toOpenActHint(act.name);
  const eveningValue =
    band.eveningStartsAt === null ? NO_EVENING : toSlotLine(band.evening, band.eveningStartsAt);
  const eveningDay = band.eveningStartsAt === null ? '' : toDayLine(band.eveningStartsAt);
  const trainingDay = band.training === null ? NO_TRAINING : toDayLine(band.training.startsAt);
  const trainingClock = optionalLine(
    band.training === null ? '' : toClockLine(band.training.startsAt),
  );
  const answer = optionalLine(
    toAnswerLine(card.owed, band.training?.answer ?? null),
    card.trainingTone,
  );
  const day = optionalLine(eveningDay);
  const practiceValue = act.playable ? PRACTICE_READY : NO_MUSIC;
  const practiceLine = optionalLine(act.playable ? '' : toAskLine(askOf(act.editors, viewerId)));

  return (
    <KkFacetTile label={act.name} order={order} attention={card.owed}>
      <KkFacetTile.Door
        icon="stage"
        label={meta}
        hint={hint}
        component={Link}
        to={link.to}
        params={link.params}
        search={link.search}
      />
      <KkFacetTile.Figure value={act.name} size="medium" />
      <KkFacetTile.Band>
        <KkFacetTile.Stack>
          <KkFacetTile.Line>{EVENING_LABEL}</KkFacetTile.Line>
          <KkFacetTile.Line tone="strong" lines={2}>
            {eveningValue}
          </KkFacetTile.Line>
          {day}
        </KkFacetTile.Stack>
        <KkFacetTile.Stack>
          <KkFacetTile.Line>{TRAINING_LABEL}</KkFacetTile.Line>
          <KkFacetTile.Line tone="strong">{trainingDay}</KkFacetTile.Line>
          {trainingClock}
          {answer}
        </KkFacetTile.Stack>
        <KkFacetTile.Stack>
          <KkFacetTile.Line>{PRACTICE_LABEL}</KkFacetTile.Line>
          <KkFacetTile.Line tone={card.practiceTone} lines={2}>
            {practiceValue}
          </KkFacetTile.Line>
          {practiceLine}
        </KkFacetTile.Stack>
      </KkFacetTile.Band>
    </KkFacetTile>
  );
};
