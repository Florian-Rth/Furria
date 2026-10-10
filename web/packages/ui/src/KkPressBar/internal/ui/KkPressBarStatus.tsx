import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import type { KkRegisterMarkState } from '../../../KkRegisterMark';
import { KkRegisterMark } from '../../../KkRegisterMark';

export type KkPressLineTone = 'quiet' | 'busy' | 'warning' | 'alert';

interface KkPressBarStatusProps {
  state: KkRegisterMarkState;
  stateWord: string;
  line: string;
  lineTone: KkPressLineTone;
  foreignNote?: string;
}

const LINE_COLORS: Record<KkPressLineTone, string> = {
  quiet: 'text.secondary',
  busy: 'text.secondary',
  warning: 'text.secondary',
  alert: 'error.main',
};

export const KkPressBarStatus: FC<KkPressBarStatusProps> = ({
  state,
  stateWord,
  line,
  lineTone,
  foreignNote,
}) => {
  const foreign =
    foreignNote === undefined ? null : (
      <Typography
        variant="caption"
        role="status"
        sx={{
          fontWeight: 700,
          color: 'info.main',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {foreignNote}
      </Typography>
    );

  const lineInk = lineTone === 'warning' ? goldInkOf : null;

  return (
    <Stack
      direction="row"
      data-kk-press-bar-status
      sx={{ gap: 1.25, alignItems: 'center', minWidth: 0, flex: { xs: 1, md: '0 1 auto' } }}
    >
      <KkRegisterMark state={state} size={22} />
      <Stack sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 900, lineHeight: 1.25 }}>
          {stateWord}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          aria-live={lineTone === 'alert' ? 'assertive' : 'off'}
          sx={[{ fontWeight: 700, lineHeight: 1.3, color: LINE_COLORS[lineTone] }, lineInk]}
        >
          {line}
        </Typography>
        {foreign}
      </Stack>
    </Stack>
  );
};
