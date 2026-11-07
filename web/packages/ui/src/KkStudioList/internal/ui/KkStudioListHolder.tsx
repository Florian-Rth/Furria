import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioListHolderProps {
  holderRef: (element: Element | null) => void;
  text: string;
  label: string;
  dragging: boolean;
}

export const KkStudioListHolder: FC<KkStudioListHolderProps> = ({
  holderRef,
  text,
  label,
  dragging,
}) => (
  <ButtonBase
    ref={holderRef}
    disableRipple
    aria-label={label}
    data-dragging={dragging}
    sx={(theme) => ({
      minHeight: '2rem',
      maxWidth: '100%',
      px: 1.25,
      justifyContent: 'flex-start',
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      touchAction: 'none',
      cursor: 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      '&[data-dragging="true"]': {
        zIndex: 3,
        boxShadow: kkTokens.shadow.floating,
        backgroundColor: palette(theme).primary.main,
        color: palette(theme).primary.contrastText,
      },
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{
        fontWeight: 800,
        color: 'inherit',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {text}
    </Typography>
  </ButtonBase>
);
