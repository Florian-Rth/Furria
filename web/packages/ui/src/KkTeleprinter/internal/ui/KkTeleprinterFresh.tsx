import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkTeleprinterFreshProps {
  label: string;
  onReveal: () => void;
}

export const KkTeleprinterFresh: FC<KkTeleprinterFreshProps> = ({ label, onReveal }) => (
  <ButtonBase
    onClick={onReveal}
    data-kk-teleprinter-fresh
    sx={(theme) => ({
      ...theme.typography.caption,
      position: 'sticky',
      top: kkTokens.layout.stickyTop,
      zIndex: 1,
      alignSelf: 'center',
      px: 1.75,
      py: 0.625,
      fontWeight: 900,
      letterSpacing: kkTokens.type.tracking.label,
      textTransform: 'uppercase',
      borderRadius: `${kkTokens.radius.pill}px`,
      color: 'background.paper',
      backgroundColor: 'text.primary',
      boxShadow: kkTokens.shadow.floating,
      ...focusRing(theme),
    })}
  >
    {label}
  </ButtonBase>
);
