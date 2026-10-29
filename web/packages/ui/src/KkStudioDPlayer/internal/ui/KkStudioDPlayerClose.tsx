import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkStudioDGlyph } from '../../../KkStudioDGlyph/KkStudioDGlyph';
import { kkTokens } from '../../../tokens';
import { glassOf } from '../player-paint';

interface KkStudioDPlayerCloseProps {
  label: string;
  onClose: () => void;
}

export const KkStudioDPlayerClose: FC<KkStudioDPlayerCloseProps> = ({ label, onClose }) => (
  <ButtonBase
    aria-label={label}
    onClick={onClose}
    data-kk-studio-d-close
    sx={(theme) => ({
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      flexShrink: 0,
      borderRadius: '50%',
      ...glassOf(theme),
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(.92)' },
      ...focusRing(theme),
    })}
  >
    <KkStudioDGlyph name="close" size="1.125rem" />
  </ButtonBase>
);
