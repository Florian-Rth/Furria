import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkGreetingBeat } from '../../../KkGreeting/internal/logic/greeting-context';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { useCountBoard } from '../logic/use-count-board';
import { useCountFit } from '../logic/use-count-fit';
import { CountCaption } from './CountCaption';
import { CountMark } from './CountMark';
import { CountTile } from './CountTile';

const TAP_MIN = '2.75rem';

const BLOCK: CSSObject = {
  flex: 1,
  alignItems: 'flex-start',
  minWidth: TAP_MIN,
  minHeight: TAP_MIN,
  justifyContent: 'center',
  cursor: 'default',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent',
  WebkitTouchCallout: 'none',
};
const LOCKUP: CSSObject = {
  alignItems: 'flex-end',
  gap: 0.75,
  my: 0.375,
  transformOrigin: 'left center',
};
const TILES: CSSObject = { alignItems: 'center', gap: 0.375 };

interface KkCountHeadCountProps {
  value: string;
  beat: KkGreetingBeat;
  label?: string;
  kicker?: string;
  unit?: string;
  onPress?: () => void;
}

export const KkCountHeadCount: FC<KkCountHeadCountProps> = ({
  value,
  beat,
  label,
  kicker,
  unit,
  onPress,
}) => {
  const board = useCountBoard(value, beat);
  const fit = useCountFit();
  const ink = board.tone === 'gold' ? 'onGold' : 'onDeep';
  const cells = board.cells.map((cell) =>
    cell.kind === 'tile' ? (
      <CountTile
        key={cell.key}
        face={cell.face}
        blank={cell.blank}
        turn={cell.turn}
        tone={board.tone}
        ink={ink}
      />
    ) : (
      <CountMark key={cell.key} face={cell.face} reveal={cell.reveal} clock={board.clock} />
    ),
  );
  const kickerMark = kicker === undefined ? null : <CountCaption>{kicker}</CountCaption>;
  const unitMark = unit === undefined ? null : <CountCaption>{unit}</CountCaption>;
  const spoken = label === undefined ? null : <KkVisuallyHidden>{label}</KkVisuallyHidden>;

  return (
    <Stack ref={fit.room} data-kk-count-head-count onClick={onPress} sx={BLOCK}>
      <Stack ref={fit.face} aria-hidden direction="row" sx={LOCKUP}>
        {kickerMark}
        <Stack direction="row" sx={TILES}>
          {cells}
        </Stack>
        {unitMark}
      </Stack>
      {spoken}
    </Stack>
  );
};
