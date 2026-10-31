import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { useBeatShown } from '../logic/use-beat-shown';
import { REDUCED_MOTION } from '../welcome-paint';

const TURN_MS = 320;
const LABEL_MS = 380;

const labelIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.6em);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const QUIET: CSSObject = {
  borderColor: 'divider',
  bgcolor: 'background.paper',
  color: 'text.primary',
  typography: 'caption',
  fontWeight: 800,
};

const GO: CSSObject = {
  borderColor: 'primary.main',
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  typography: 'button',
  fontWeight: 800,
};

interface KkWelcomeStageActionProps {
  skipLabel: string;
  goLabel: string;
  goAt: number;
  onPress: () => void;
}

export const KkWelcomeStageAction: FC<KkWelcomeStageActionProps> = ({
  skipLabel,
  goLabel,
  goAt,
  onPress,
}) => {
  const going = useBeatShown(goAt);
  const label = going ? goLabel : skipLabel;
  const look = going ? GO : QUIET;

  return (
    <ButtonBase
      autoFocus
      onClick={onPress}
      sx={[
        {
          flexShrink: 0,
          minHeight: kkTokens.tapTarget,
          px: 2.25,
          border: 1,
          borderRadius: `${kkTokens.radius.pill}px`,
          transition: `background-color ${TURN_MS}ms ease, border-color ${TURN_MS}ms ease, color ${TURN_MS}ms ease`,
          ...look,
          [REDUCED_MOTION]: { transition: 'none' },
        },
        focusRing,
      ]}
    >
      <Box
        key={label}
        component="span"
        sx={{
          display: 'block',
          animation: `${labelIn} ${LABEL_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
          [REDUCED_MOTION]: { animation: 'none' },
        }}
      >
        {label}
      </Box>
    </ButtonBase>
  );
};
