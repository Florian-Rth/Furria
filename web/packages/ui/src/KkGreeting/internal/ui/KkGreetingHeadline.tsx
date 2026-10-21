import type { FC } from 'react';
import type { FlapGlyphVariant } from '../../../internal/flap/FlapGlyph';
import type { KkScreenHeaderTitleSize } from '../../../KkScreenHeader/internal/ui/KkScreenHeaderTitle';
import { KkScreenHeader } from '../../../KkScreenHeader/KkScreenHeader';
import { SHOWN_CUE } from '../logic/greeting-cues';
import type { GreetingBoardProps } from '../logic/use-greeting-board';
import { useGreetingBoard } from '../logic/use-greeting-board';
import { GreetingInkCell } from './GreetingInkCell';
import { GreetingTwin } from './GreetingTwin';

const TWIN_GLYPHS: Record<KkScreenHeaderTitleSize, FlapGlyphVariant> = {
  page: 'h1',
  compact: 'h3',
};

interface KkGreetingHeadlineProps extends GreetingBoardProps {
  size?: KkScreenHeaderTitleSize;
}

export const KkGreetingHeadline: FC<KkGreetingHeadlineProps> = ({ size = 'page', ...props }) => {
  const board = useGreetingBoard(props);
  const ink = board.cells.map((cell, index) => (
    <GreetingInkCell
      key={cell.slot}
      cell={cell}
      cue={board.cues[index] ?? SHOWN_CUE}
      clock={board.clock}
      festive={board.festive}
    />
  ));

  return (
    <>
      <KkScreenHeader.Title size={size}>{ink}</KkScreenHeader.Title>
      <GreetingTwin twin={board.twin} clock={board.clock} glyph={TWIN_GLYPHS[size]} />
    </>
  );
};
