import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RepeatOneRoundedIcon from '@mui/icons-material/RepeatOneRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkTrainingViewKey } from './KkTrainingViewKey';

interface KkTrainingViewKeysProps {
  playing: boolean;
  playLabel: string;
  backLabel: string;
  loopLabel: string;
  looping: boolean;
  canPlay: boolean;
  canLoop: boolean;
  onToggle: () => void;
  onBack: () => void;
  onLoop: () => void;
}

export const KkTrainingViewKeys: FC<KkTrainingViewKeysProps> = ({
  playing,
  playLabel,
  backLabel,
  loopLabel,
  looping,
  canPlay,
  canLoop,
  onToggle,
  onBack,
  onLoop,
}) => {
  const playGlyph = playing ? (
    <PauseRoundedIcon fontSize="large" />
  ) : (
    <PlayArrowRoundedIcon fontSize="large" />
  );

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr) minmax(0, 2fr)',
        gap: 1,
      }}
    >
      <KkTrainingViewKey
        label={backLabel}
        glyph={<SkipPreviousRoundedIcon />}
        disabled={!canLoop}
        onPress={onBack}
      />
      <KkTrainingViewKey
        strong
        label={playLabel}
        glyph={playGlyph}
        disabled={!canPlay}
        onPress={onToggle}
      />
      <KkTrainingViewKey
        strong={looping}
        label={loopLabel}
        glyph={<RepeatOneRoundedIcon />}
        pressed={looping}
        disabled={!canLoop}
        onPress={onLoop}
      />
    </Box>
  );
};
