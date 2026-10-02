import type { FC } from 'react';
import { KkScreenHeader } from '../../../KkScreenHeader/KkScreenHeader';
import { SHOWN_CUE } from '../logic/greeting-cues';
import type { GreetingBoardProps } from '../logic/use-greeting-board';
import { useGreetingBoard } from '../logic/use-greeting-board';
import { GreetingInkCell } from './GreetingInkCell';
import { GreetingTwin } from './GreetingTwin';

export const KkGreetingHeadline: FC<GreetingBoardProps> = (props) => {
  const board = useGreetingBoard(props);
  const ink = board.cells.map((cell, index) => (
    <GreetingInkCell
      key={cell.slot}
      cell={cell}
      cue={board.cues[index] ?? SHOWN_CUE}
      festive={board.festive}
    />
  ));

  return (
    <>
      <KkScreenHeader.Title>{ink}</KkScreenHeader.Title>
      <GreetingTwin twin={board.twin} />
    </>
  );
};
