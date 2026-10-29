import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkEyebrow } from '../../../KkEyebrow';
import { KkStudioDGlyph } from '../../../KkStudioDGlyph/KkStudioDGlyph';
import { onFootage } from '../player-paint';

const ARRIVE_SECONDS = 0.4;
const NO_PART = '\u00a0';

interface KkStudioDPlayerStepProps {
  label: string;
  part: string | null;
  name: string;
  onOpen: () => void;
}

export const KkStudioDPlayerStep: FC<KkStudioDPlayerStepProps> = ({
  label,
  part,
  name,
  onOpen,
}) => {
  const kicker = part ?? NO_PART;

  return (
    <ButtonBase
      aria-label={label}
      onClick={onOpen}
      data-kk-studio-d-step
      sx={(theme) => ({
        minWidth: 0,
        flex: 1,
        minHeight: '2.75rem',
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: 1,
        pointerEvents: 'auto',
        color: 'text.primary',
        ...focusRing(theme),
      })}
    >
      <Stack
        key={name}
        sx={{
          minWidth: 0,
          animation: `kk-studio-d-arrive ${ARRIVE_SECONDS}s ease-out`,
          '@keyframes kk-studio-d-arrive': { from: { opacity: 0 }, to: { opacity: 1 } },
        }}
      >
        <KkEyebrow tone="muted" sx={{ lineHeight: 1.3, ...onFootage }}>
          {kicker}
        </KkEyebrow>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Typography variant="h2" component="p" noWrap sx={{ lineHeight: 1.1, ...onFootage }}>
            {name}
          </Typography>
          <KkStudioDGlyph name="steps" size="1.25rem" sx={{ opacity: 0.7 }} />
        </Stack>
      </Stack>
    </ButtonBase>
  );
};
