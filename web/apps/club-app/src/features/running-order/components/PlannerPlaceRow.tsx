import { KkNumberedList } from '@furria/ui/KkNumberedList';
import { KkSeverityGlyph } from '@furria/ui/KkSeverityGlyph';
import type { FC } from 'react';
import type { DraftLine } from '@/features/running-order/types';
import { usePlanner } from '../planner-context';
import {
  PLACE_CURRENT,
  PLACE_RECOMMENDED,
  PLACES_TITLE,
  toLineName,
  toPlaceChange,
  toPlaceTitle,
  toPlaceTotal,
  toTallySeverity,
} from '../planner-copy';
import type { PlaceOption } from '../planner-fixes';

interface PlannerPlaceRowProps {
  line: DraftLine;
  option: PlaceOption;
}

export const PlannerPlaceRow: FC<PlannerPlaceRowProps> = ({ line, option }) => {
  const planner = usePlanner();
  const choose = (): void => {
    planner.moveTo(line.key, option.to);
  };
  const title = toPlaceTitle(toLineName(option.previousKey, planner.lineNameOf), option.last);
  const change = toPlaceChange(option.delta);
  const changePart = change === null ? null : <span>{change}</span>;
  const recommendedPart = option.recommended ? <span>{PLACE_RECOMMENDED}</span> : null;
  const severity = option.current ? null : (
    <KkSeverityGlyph state={toTallySeverity(option.tally)} />
  );
  const currentPart = option.current ? <span>{PLACE_CURRENT}</span> : null;

  const fact = (
    <>
      {currentPart}
      {severity}
      <span>{toPlaceTotal(option.tally)}</span>
      {changePart}
      {recommendedPart}
    </>
  );

  return (
    <KkNumberedList.Row
      rowKey={`place:${line.key}:${option.to}`}
      number={String(option.to + 1)}
      mark={null}
      title={title}
      fact={fact}
      state={option.current ? 'selected' : 'rest'}
      arrive={false}
      openLabel={PLACES_TITLE}
      onOpen={option.current ? undefined : choose}
    />
  );
};
