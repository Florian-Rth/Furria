import type { CSSProperties, FC } from 'react';
import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import { FlapTile } from '../../../internal/flap/FlapTile';
import type { CountInk } from '../count-paint';
import { letterFaceOf, letterVisibilityOf, starVisibilityOf } from '../logic/count-run';
import type { CountTurn } from '../logic/use-count-board';
import { CountFace } from './CountFace';
import { CountFlap } from './CountFlap';
import { CountGlyph } from './CountGlyph';

const CELL: CSSProperties = { position: 'relative', display: 'inline-grid' };
const SIZER: CSSProperties = { gridArea: '1 / 1', visibility: 'hidden' };
const LAYER: CSSProperties = { position: 'absolute', inset: 0 };
const WIDEST_FACE = '0';
const NO_FACE = '';

interface CountTileProps {
  face: string;
  blank: boolean;
  turn: CountTurn | null;
  tone: FlapTileTone;
  ink: CountInk;
}

export const CountTile: FC<CountTileProps> = ({ face, blank, turn, tone, ink }) => {
  const shownFace = blank ? NO_FACE : face;
  const letterFace = letterFaceOf(shownFace);
  const letter = letterVisibilityOf(shownFace);
  const star = starVisibilityOf(shownFace);
  const layer =
    turn === null ? (
      <span style={LAYER}>
        <FlapTile tone={tone} />
        <CountGlyph ink={ink}>
          <CountFace face={letterFace} letter={letter} star={star} />
        </CountGlyph>
      </span>
    ) : (
      <CountFlap key={turn.key} run={turn.run} clock={turn.clock} tone={tone} ink={ink} />
    );

  return (
    <span style={CELL}>
      <span style={SIZER}>
        <CountGlyph ink={ink}>{WIDEST_FACE}</CountGlyph>
      </span>
      {layer}
    </span>
  );
};
